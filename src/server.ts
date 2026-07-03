import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const tournamentFilePath = path.join(__dirname, 'tournament.json');

// SEÇÃO DO PAINEL DE ADMINISTRAÇÃO (HTML/Interface Visual)
app.get('/', (req: Request, res: Response) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Painel de Controle - Stumble Guys</title>
        <style>
            body { font-family: Arial, sans-serif; background: #121212; color: #fff; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #1e1e1e; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            h1 { text-align: center; color: #00ff88; font-size: 24px; }
            label { display: block; margin: 15px 0 5px; font-weight: bold; color: #ccc; }
            input, select { width: 100%; padding: 10px; border: 1px solid #333; background: #2a2a2a; color: #fff; border-radius: 4px; box-sizing: border-radius; font-size: 16px; }
            button { width: 100%; padding: 12px; margin-top: 25px; background: #00ff88; border: none; color: #000; font-weight: bold; font-size: 16px; border-radius: 4px; cursor: pointer; transition: 0.2s; }
            button:hover { background: #00cc6e; }
            #status { margin-top: 15px; text-align: center; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Painel do Torneio</h1>
            <form id="tournamentForm">
                <label for="title">Nome do Torneio:</label>
                <input type="text" id="title" required>

                <label for="map">Mapa Principal:</label>
                <select id="map">
                    <option value="Block Dash">Block Dash</option>
                    <option value="Super Slide">Super Slide</option>
                    <option value="Laser Tracer">Laser Tracer</option>
                    <option value="Rush Hour">Rush Hour</option>
                </select>

                <label for="maxPlayers">Máximo de Jogadores:</label>
                <input type="number" id="maxPlayers" required>

                <label for="statusSelect">Status do Evento:</label>
                <select id="statusSelect">
                    <option value="active">Ativo (Liberado no Jogo)</option>
                    <option value="hidden">Oculto</option>
                </select>

                <button type="submit">Salvar e Atualizar GitHub</button>
            </form>
            <div id="status">Carregando dados atuais...</div>
        </div>

        <script>
            // Carrega os dados atuais da API assim que abre a página
            async function loadData() {
                try {
                    const res = await fetch('/api/tournament');
                    if (res.ok) {
                        const data = await res.json();
                        document.getElementById('title').value = data.title || '';
                        document.getElementById('map').value = data.map || 'Block Dash';
                        document.getElementById('maxPlayers').value = data.maxPlayers || 32;
                        document.getElementById('statusSelect').value = data.status || 'active';
                        document.getElementById('status').innerText = 'Dados carregados do tournament.json!';
                        document.getElementById('status').style.color = '#00ff88';
                    } else {
                        document.getElementById('status').innerText = 'Nenhum torneio ativo encontrado. Preencha para criar.';
                        document.getElementById('status').style.color = '#ffaa00';
                    }
                } catch (err) {
                    document.getElementById('status').innerText = 'Erro ao conectar com a API.';
                    document.getElementById('status').style.color = '#ff3333';
                }
            }

            // Envia as modificações para salvar no repositório
            document.getElementById('tournamentForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                document.getElementById('status').innerText = 'Enviando commit para o GitHub...';
                document.getElementById('status').style.color = '#ffaa00';

                const updatedData = {
                    title: document.getElementById('title').value,
                    map: document.getElementById('map').value,
                    maxPlayers: parseInt(document.getElementById('maxPlayers').value),
                    status: document.getElementById('statusSelect').value
                };

                try {
                    const res = await fetch('/api/tournament/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedData)
                    });
                    const result = await res.json();
                    if (res.ok) {
                        document.getElementById('status').innerText = '✓ ' + result.message;
                        document.getElementById('status').style.color = '#00ff88';
                    } else {
                        document.getElementById('status').innerText = 'Erro: ' + result.error;
                        document.getElementById('status').style.color = '#ff3333';
                    }
                } catch (err) {
                    document.getElementById('status').innerText = 'Falha crítica na rede.';
                    document.getElementById('status').style.color = '#ff3333';
                }
            });

            loadData();
        </script>
    </body>
    </html>
    `);
});

// Rota da API para ler os dados do torneio
app.get('/api/tournament', (req: Request, res: Response) => {
    try {
        if (!fs.existsSync(tournamentFilePath)) {
            return res.status(404).json({ error: 'Arquivo do torneio não encontrado.' });
        }
        const fileData = fs.readFileSync(tournamentFilePath, 'utf-8');
        return res.json(JSON.parse(fileData));
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao ler os dados do torneio.' });
    }
});

// Rota da API para salvar e fazer o commit de volta no GitHub
app.post('/api/tournament/save', async (req: Request, res: Response) => {
    const newData = req.body;
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const gitFilePath = process.env.GITHUB_FILE_PATH || 'src/tournament.json';

    if (!token || !repo) {
        return res.status(500).json({ error: 'Variáveis GITHUB_TOKEN ou GITHUB_REPO não configuradas no Render.' });
    }

    try {
        fs.writeFileSync(tournamentFilePath, JSON.stringify(newData, null, 2), 'utf-8');

        const url = `https://api.github.com/repos/${repo}/contents/${gitFilePath}?ref=${branch}`;
        const headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Render-Backend-Bot'
        };

        let sha = '';
        const getFileRes = await fetch(url, { headers });
        if (getFileRes.ok) {
            const fileInfo = await getFileRes.json() as { sha: string };
            sha = fileInfo.sha;
        }

        const commitBody = {
            message: 'Atualização do torneio via Painel de Admin',
            content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
            sha: sha || undefined,
            branch: branch
        };

        const updateRes = await fetch(url, {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(commitBody)
        });

        if (!updateRes.ok) {
            const errorText = await updateRes.text();
            throw new Error(`Erro ao commitar no GitHub: ${errorText}`);
        }

        return res.json({ success: true, message: 'Dados sincronizados com o GitHub!' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message || 'Falha ao sincronizar dados com o GitHub.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
