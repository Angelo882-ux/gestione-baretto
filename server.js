const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

const pool = mysql.createPool({
	host: process.env.DB_HOST || '127.0.0.1',
	port: Number(process.env.DB_PORT || 3306),
	user: process.env.DB_USER || 'utente',
	password: process.env.DB_PASSWORD || 'password',
	database: process.env.DB_NAME || 'baretto',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

async function initializeDatabase() {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS prodotti (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			nome VARCHAR(120) NOT NULL,
			descrizione TEXT NULL,
			prezzo DECIMAL(10, 2) NOT NULL,
			disponibile BOOLEAN NOT NULL DEFAULT TRUE,
			creato_il TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
	`);

	await pool.query(`
		CREATE TABLE IF NOT EXISTS personale (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			nome VARCHAR(100) NOT NULL,
			cognome VARCHAR(100) NOT NULL,
			ruolo VARCHAR(80) NOT NULL,
			email VARCHAR(255) NULL UNIQUE,
			attivo BOOLEAN NOT NULL DEFAULT TRUE,
			creato_il TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
	`);

	await pool.query(`
		CREATE TABLE IF NOT EXISTS ordini (
			id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
			prodotto_id INT UNSIGNED NOT NULL,
			personale_id INT UNSIGNED NOT NULL,
			quantita INT UNSIGNED NOT NULL DEFAULT 1,
			prezzo_unitario DECIMAL(10, 2) NOT NULL,
			stato VARCHAR(30) NOT NULL DEFAULT 'in_attesa',
			creato_il TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT fk_ordini_prodotto FOREIGN KEY (prodotto_id)
				REFERENCES prodotti(id),
			CONSTRAINT fk_ordini_personale FOREIGN KEY (personale_id)
				REFERENCES personale(id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
	`);
}

app.get('/health', async (request, response) => {
	try {
		await pool.query('SELECT 1');
		response.json({ status: 'ok', database: 'baretto' });
	} catch (error) {
		response.status(500).json({ status: 'error', message: 'Database non disponibile' });
	}
});

app.use((request, response) => {
	response.status(404).json({ error: 'Rotta non trovata' });
});

async function startServer() {
	await initializeDatabase();
	const port = Number(process.env.PORT || 3000);
	app.listen(port, () => console.log(`Server avviato sulla porta ${port}`));
}

startServer().catch((error) => {
	console.error('Avvio non riuscito:', error.message);
	process.exit(1);
});
