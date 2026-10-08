# Gestione Baretto

## Prerequisiti

- Node.js 18 o successivo e npm
- Docker con Docker Compose

## Configurazione e avvio

1. Installa le dipendenze:

	```bash
	npm ci
	```

2. Avvia MySQL in background:

	```bash
	docker compose up -d mysql
	```

	Compose crea il database `baretto` e l'utente `utente`, con password `password`, sulla porta `3306`. Al primo avvio il server crea automaticamente le tabelle necessarie.

3. Avvia l'applicazione:

	```bash
	npm start
	```

	Il server ascolta sulla porta `3000`. Per cambiare porta o credenziali, passa le variabili d'ambiente al comando. Per esempio:

	```bash
	DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=utente DB_PASSWORD=password DB_NAME=baretto PORT=3000 npm start
	```

	Le variabili supportate sono `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` e `PORT`. I valori dell'esempio coincidono con quelli predefiniti.

4. Verifica che server e database siano raggiungibili:

	```bash
	curl http://localhost:3000/health
	```

	Una risposta corretta è `{"status":"ok","database":"baretto"}`. Attualmente l'applicazione espone questa rotta di controllo; l'interfaccia web non è ancora implementata.

Per fermare il server usa `Ctrl+C`; per fermare MySQL esegui `docker compose down`. I dati del database restano nel volume Docker. `docker compose down -v` elimina anche quel volume e i dati salvati.