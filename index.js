import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import mysql from 'mysql2/promise';

const app = express();

// 1) Pool MySQL
const pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'hotel_user',
    password: process.env.DB_PASS     || 'password_par_defaut',
    database: process.env.DB_NAME     || 'gestion_hotels',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0
});

// 2) Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 3) Static
app.use(express.static(path.resolve('public')));

// 4) Auth (mock)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'secret') {
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});
app.get('/logout', (_, res) => res.json({ loggedOut: true }));
app.get('/is-authenticated', (_, res) => res.json({ authenticated: true }));

// 5) Réservation
app.post('/reserve', async (req, res) => {
    try {
        const { idClient, idHotel, idType, dateResa, dateDebut, dateFin, nbPersonnes, arrhes, statut } = req.body;
        const [r] = await pool.execute(
            `INSERT INTO RESERVATION
         (idClient,idHotel,idType,dateResa,dateDebut,dateFin,nbPersonnes,arrhes,statut)
       VALUES (?,?,?,?,?,?,?,?,?)`,
            [idClient, idHotel, idType, dateResa, dateDebut, dateFin, nbPersonnes, arrhes, statut]
        );
        res.json({ success: true, idResa: r.insertId });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// 6) Annulation
app.post('/annuler', async (req, res) => {
    try {
        const { idResa, dateAnnulation } = req.body;
        await pool.execute(
            `INSERT INTO ANNULATION (idResa,dateAnnulation) VALUES (?,?)`,
            [idResa, dateAnnulation]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// 7) Arrivée
app.post('/arrivee', async (req, res) => {
    try {
        const { idResa, dateArrivee } = req.body;
        await pool.execute(
            `INSERT INTO ARRIVEE (idResa,dateArrivee) VALUES (?,?)`,
            [idResa, dateArrivee]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// 8) Service
app.post('/service', async (req, res) => {
    try {
        const { idResa, typeService, dateService, montant } = req.body;
        await pool.execute(
            `INSERT INTO SERVICE (idResa,typeService,dateService,montant) VALUES (?,?,?,?)`,
            [idResa, typeService, dateService, montant]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// 9) Facturation
app.post('/facturation', async (req, res) => {
    try {
        const { idResa, montantChambres, montantServices, montantTotal } = req.body;
        await pool.execute(
            `INSERT INTO FACTURATION (idResa,montantChambres,montantServices,montantTotal)
       VALUES (?,?,?,?)`,
            [idResa, montantChambres, montantServices, montantTotal]
        );
        res.json({ success: true });
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ success: false, error: 'Cette réservation a déjà été facturée.' });
        } else {
            res.status(400).json({ success: false, error: e.message });
        }
    }
});

// 10) Rapport journalière
app.get('/rapport/journaliere', async (req, res) => {
    try {
        const { date_cible } = req.query;
        const [rows] = await pool.execute(
            `SELECT h.nom AS hotel, c.nom AS client, r.dateDebut, r.dateFin
       FROM RESERVATION r
       JOIN HOTEL h USING(idHotel)
       JOIN CLIENT c USING(idClient)
       WHERE ? BETWEEN r.dateDebut AND DATE_SUB(r.dateFin, INTERVAL 1 DAY)`,
            [date_cible]
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 11) Bilan trimestriel
app.get('/rapport/trimestriel', async (req, res) => {
    try {
        const { debut, fin } = req.query;
        const [rows] = await pool.execute(
            `SELECT tc.libelle,
              SUM(DATEDIFF(r.dateFin, r.dateDebut)) AS nuitsFacturees,
              COUNT(r.idResa) AS nbReservations,
              SUM(f.montantTotal) AS caTotal
       FROM RESERVATION r
       JOIN TYPE_CONFORT tc USING(idType)
       JOIN FACTURATION f USING(idResa)
       WHERE r.dateResa BETWEEN ? AND ? AND r.statut='confirmée'
       GROUP BY tc.libelle`,
            [debut, fin]
        );
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// démarrage
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serveur démarré sur http://localhost:${port}`));
