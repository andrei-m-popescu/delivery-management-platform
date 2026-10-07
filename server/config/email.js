const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendStatusEmail = async (toEmail, clientName, carName, status) => {
    const statusMessages = {
        approved: `Cererea ta pentru ${carName} a fost aprobata! Un livrator a fost asignat.`,
        in_progress: `Masina ta (${carName}) este acum in drum spre tine!`,
        delivered: `Masina ta (${carName}) a fost livrata cu succes!`,
        delivered_with_damage: `Masina ta (${carName}) a fost livrata. Va rugam sa verificati eventualele daune documentate.`
    };

    const message = statusMessages[status];
    if (!message) return;

    try {
        await transporter.sendMail({
            from: `"AutoDrop" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `AutoDrop — Update livrare ${carName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1a73e8; margin-bottom: 8px;">AutoDrop</h2>
                    <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 20px;">
                    <p style="font-size: 16px;">Buna, <strong>${clientName}</strong>!</p>
                    <p style="font-size: 15px; color: #333;">${message}</p>
                    <p style="font-size: 14px; color: #666;">Poti urmari statusul livrarii tale in aplicatie.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                    <p style="color: #999; font-size: 12px;">Acest email a fost trimis automat de AutoDrop.</p>
                </div>
            `
        });
    } catch (err) {
        console.error('Eroare trimitere email client:', err.message);
    }
};

const sendDelivererEmail = async (toEmail, delivererName, carName, clientName, address) => {
    try {
        await transporter.sendMail({
            from: `"AutoDrop" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `AutoDrop — Livrare noua asignata`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1a73e8; margin-bottom: 8px;">AutoDrop</h2>
                    <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 20px;">
                    <p style="font-size: 16px;">Buna, <strong>${delivererName}</strong>!</p>
                    <p style="font-size: 15px; color: #333;">Ti-a fost asignata o noua livrare:</p>
                    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p style="margin: 4px 0;"><strong>Autoturism:</strong> ${carName}</p>
                        <p style="margin: 4px 0;"><strong>Client:</strong> ${clientName}</p>
                        <p style="margin: 4px 0;"><strong>Adresa livrare:</strong> ${address}</p>
                    </div>
                    <p style="font-size: 14px; color: #666;">Acceseaza aplicatia pentru a vedea detaliile complete.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;">
                    <p style="color: #999; font-size: 12px;">Acest email a fost trimis automat de AutoDrop.</p>
                </div>
            `
        });
    } catch (err) {
        console.error('Eroare trimitere email livrator:', err.message);
    }
};

module.exports = { sendStatusEmail, sendDelivererEmail };