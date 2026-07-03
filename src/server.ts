import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const tournamentFilePath = path.join(__dirname, 'tournament.json');

// Interface visual com todas as novas opções configuráveis
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
            .container { max-width: 650px; margin: 0 auto; background: #1e1e1e; padding: 20px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            h1 { text-align: center; color: #00ff88; font-size: 24px; margin-bottom: 20px; }
            h3 { color: #00ff88; border-bottom: 1px solid #333; padding-bottom: 5px; margin-top: 25px; }
            label { display: block; margin: 12px 0 5px; font-weight: bold; color: #ccc; }
            input, select { width: 100%; padding: 10px; border: 1px solid #333; background: #2a2a2a; color: #fff; border-radius: 4px; box-sizing: border-box; font-size: 16px; }
            .checkbox-group { background: #2a2a2a; padding: 10px; border-radius: 4px; border: 1px solid #333; }
            .checkbox-item { margin: 8px 0; display: flex; align-items: center; }
            .checkbox-item input { width: auto; margin-right: 10px; }
            .row { display: flex; gap: 10px; }
            .row div { flex: 1; }
            button { width: 100%; padding: 14px; margin-top: 30px; background: #00ff88; border: none; color: #000; font-weight: bold; font-size: 16px; border-radius: 4px; cursor: pointer; transition: 0.2s; }
            button:hover { background: #00cc6e; }
            #status { margin-top: 15px; text-align: center; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Configuração do Evento Dinâmico</h1>
            <form id="tournamentForm">
                
                <h3>Informações Básicas</h3>
                <label for="title">Nome do Torneio:</label>
                <input type="text" id="title" required>

                <label for="imageUrl">Link da Imagem (URL):</label>
                <input type="url" id="imageUrl" placeholder="https://linkdaimagem.com/foto.png" required>

                <div class="row">
                    <div>
                        <label for="map">Mapa Principal:</label>
                        <select id="map">
                            <option value="Block Dash">Block Dash</option>
                            <option value="Super Slide">Super Slide</option>
                            <option value="Laser Tracer">Laser Tracer</option>
                            <option value="Rush Hour">Rush Hour</option>
                        </select>
                    </div>
                    <div>
                        <label for="rounds">Quantidade de Fases:</label>
                        <input type="number" id="rounds" min="1" max="5" required>
                    </div>
                </div>

                <label for="maxPlayers">Máximo de Jogadores:</label>
                <input type="number" id="maxPlayers" required>

                <h3>Premiação em Gemas</h3>
                <div class="row">
                    <div>
                        <label for="gem1">1º Lugar 🥇:</label>
                        <input type="number" id="gem1" min="0" required>
                    </div>
                    <div>
                        <label for="gem2">2º Lugar 🥈:</label>
                        <input type="number" id="gem2" min="0" required>
                    </div>
                    <div>
                        <label for="gem3">3º Lugar 🥉:</label>
                        <input type="number" id="gem3" min="0" required>
                    </div>
                </div>

                <h3>Emotes Especiais Liberados</h3>
                <div class="checkbox-group">
                    <div class="checkbox-item"><input type="checkbox" id="emote_punch" value="punch"> <label for="emote_punch" style="display:inline;margin:0;">Soco (Punch)</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="emote_kick" value="kick"> <label for="emote_kick" style="display:inline;margin:0;">Rasteira (Kick)</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="emote_hug" value="hug"> <label for="emote_hug" style="display:inline;margin:0;">Abraço (Hug)</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="emote_heart" value="heart"> <label for="emote_heart" style="display:inline;margin:0;">Coração (Heart)</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="emote_banana" value="banana"> <label for="emote_banana" style="display:inline;margin:0;">Banana (Banana)</label></div>
                </div>

                <label for="statusSelect">Status do Evento:</label>
                <select id="statusSelect">
                    <option value="active">Ativo</option>
                    <option value="hidden">Oculto</option>
                </select>

                <button type="submit">Salvar e Sincronizar com GitHub</button>
            </form>
            <div id="status">Carregando dados atuais...</div>
        </div>

        <script>
            async function loadData() {
                try {
                    const res = await fetch('/api/tournament');
                    if (res.ok) {
                        const data = await res.json();
                        document.getElementById('title').value = data.title || '';
                        document.getElementById('imageUrl').value = data.imageUrl || '';
                        document.getElementById('map').value = data.map || 'Block Dash';
                        document.getElementById('rounds').value = data.rounds || 3;
                        document.getElementById('maxPlayers').value = data.maxPlayers || 32;
                        document.getElementById('statusSelect').value = data.status || 'active';
                        
                        // Premiações
                        document.getElementById('gem1').value = data.rewards?.firstPlace || 0;
                        document.getElementById('gem2').value = data.rewards?.secondPlace || 0;
                        document.getElementById('gem3').value = data.rewards?.thirdPlace || 0;
                        
                        // Emotes
                        const allowedEmotes = data.allowedEmotes || [];
                        document.getElementById('emote_punch').checked = allowedEmotes.includes('punch');
                        document.getElementById('emote_kick').checked = allowedEmotes.includes('kick');
                        document.getElementById('emote_hug').checked = allowedEmotes.includes('hug');
                        document.getElementById('emote_heart').checked = allowedEmotes.includes('heart');
                        document.getElementById('emote_banana').checked = allowedEmotes.includes('banana');

                        document.getElementById('status').innerText = 'Dados carregados com sucesso!';
                        document.getElementById('status').style.color = '#00ff88';
                    } else {
                        document.getElementById('status').innerText = 'Sem dados salvos. Configure acima.';
                        document.getElementById('status').style.color = '#ffaa00';
                    }
                } catch (err) {
                    document.getElementById('status').innerText = 'Erro ao carregar dados do tournament.json.';
                    document.getElementById('status').style.color = '#ff3333';
                }
            }

            document.getElementById('tournamentForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                document.getElementById('status').innerText = 'Enviando commit para o GitHub...';
                document.getElementById('status').style.color = '#ffaa00';

                const allowedEmotes = [];
                if(document.getElementById('emote_punch').checked) allowedEmotes.push('punch');
                if(document.getElementById('emote_kick').checked) allowedEmotes.push('kick');
                if(document.getElementById('emote_hug').checked) allowedEmotes.push('hug');
                if(document.getElementById('emote_heart').checked) allowedEmotes.push('heart');
                if(document.getElementById('emote_banana').checked) allowedEmotes.push('banana');

                const updatedData = {
                    title: document.getElementById('title').value,
                    imageUrl: document.getElementById('imageUrl').value,
                    map: document.getElementById('map').value,
                    rounds: parseInt(document.getElementById('rounds').value),
                    maxPlayers: parseInt(document.getElementById('maxPlayers').value),
                    rewards: {
                        firstPlace: parseInt(document.getElementById('gem1').value),
                        secondPlace: parseInt(document.getElementById('gem2').value),
                        thirdPlace: parseInt(document.getElementById('gem3').value)
                    },
                    allowedEmotes: allowedEmotes,
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
                    document.getElementById('status').innerText = 'Falha de conexão com a API.';
                    document.getElementById('status').style.color = '#ff3333';
                }
            });

            loadData();
        </script>
    </body>
    </html>
    `);
});

// Rotas do Express para leitura e gravação no GitHub (mantidas e atualizadas)
app.get('/api/tournament', (req: Request, res: Response) => {
    try {
        if (!fs.existsSync(tournamentFilePath)) {
            return res.status(404).json({ error: 'Arquivo não encontrado.' });
        }
        const fileData = fs.readFileSync(tournamentFilePath, 'utf-8');
        return res.json(JSON.parse(fileData));
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao ler arquivo.' });
    }
});

app.post('/api/tournament/save', async (req: Request, res: Response) => {
    const newData = req.body;
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const gitFilePath = process.env.GITHUB_FILE_PATH || 'src/tournament.json';

    if (!token || !repo) {
        return res.status(500).json({ error: 'Variáveis de ambiente do GitHub ausentes no Render.' });
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
            message: 'Painel Admin: Modificação de Gemas, Imagem e Fases',
            content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
            sha: sha || undefined,
            branch: branch
        };

        const updateRes = await fetch(url, {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(commitBody)
        });

        if (!updateRes.ok) throw new Error('Falha ao commitar alterações no GitHub.');

        return res.json({ success: true, message: 'Configurações sincronizadas com sucesso!' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log(`Servidor completo rodando na porta ${port}`));
