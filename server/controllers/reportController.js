const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateReport = async (req, res) => {
    try {
        // Colectam datele din baza de date
        const [requests] = await db.query(`
            SELECT dr.id, dr.status, c.brand, c.model, c.price, 
                u.name as client_name,
                d_user.name as deliverer_name
            FROM delivery_requests dr
            JOIN cars c ON dr.car_id = c.id
            JOIN users u ON dr.client_id = u.id
            LEFT JOIN deliveries d ON dr.id = d.request_id
            LEFT JOIN users d_user ON d.deliverer_id = d_user.id
            GROUP BY dr.id
        `);

        const [damages] = await db.query(`
            SELECT COUNT(*) as total_damages FROM damage_reports
        `);

        // Calculam statistici
        const totalRequests = requests.length;
        const delivered = requests.filter(r => r.status === 'delivered' || r.status === 'delivered_with_damage').length;
        const pending = requests.filter(r => r.status === 'pending').length;
        const rejected = requests.filter(r => r.status === 'rejected').length;
        const withDamage = requests.filter(r => r.status === 'delivered_with_damage').length;

        // Cele mai populare marci
        const brandCount = {};
        requests.forEach(r => {
            brandCount[r.brand] = (brandCount[r.brand] || 0) + 1;
        });
        const topBrands = Object.entries(brandCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([brand, count]) => `${brand} (${count} cereri)`);

        // Performanta livratori
        const delivererCount = {};
        requests.forEach(r => {
            if (r.deliverer_name) {
                delivererCount[r.deliverer_name] = (delivererCount[r.deliverer_name] || 0) + 1;
            }
        });
        const topDeliverers = Object.entries(delivererCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => `${name} (${count} livrari)`);

        // Valoarea medie a masinilor comandate
        const avgPrice = requests.length > 0
            ? Math.round(requests.reduce((sum, r) => sum + Number(r.price || 0), 0) / requests.length)
            : 0;

        // Trimitem datele catre Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Esti un analist de business pentru platforma AutoDrop, un serviciu premium de livrare autoturisme.

        Analizeaza aceste date si genereaza un raport SCURT si DIRECT in romana, fara titluri formale, fara formatare markdown, fara asteriscuri:

        Date:
        - Total cereri: ${totalRequests}
        - Livrate cu succes: ${delivered}
        - In asteptare: ${pending}
        - Respinse: ${rejected}
        - Livrate cu daune: ${withDamage}
        - Valoarea medie a masinilor: €${avgPrice}
        - Cele mai solicitate marci: ${topBrands.join(', ') || 'date insuficiente'}
        - Cei mai activi livratori: ${topDeliverers.join(', ') || 'date insuficiente'}

        Scrie exact 3 paragrafe scurte:
        1. Performanta generala a platformei in 2-3 propozitii
        2. Tendintele principale observate in 2-3 propozitii
        3. Maxim 2 recomandari concrete si specifice pentru administrator

        Fii direct, profesional si specific. Nu folosi cuvinte pompase. Nu folosi formatare markdown.`;

        const result = await model.generateContent(prompt);
        const report = result.response.text();

        res.json({ report, stats: { totalRequests, delivered, pending, rejected, withDamage, topBrands, topDeliverers, avgPrice } });

    } catch (err) {
        console.error('Eroare generare raport:', err);
        res.status(500).json({ message: 'Eroare la generarea raportului', error: err.message });
    }
};

module.exports = { generateReport };