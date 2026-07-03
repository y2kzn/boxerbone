import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const tournamentFilePath = path.join(__dirname, 'tournament.json');

app.get('/', (req: Request, res: Response) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Painel Admin Premium - Stumble Guys</title>
        <style>
            body { font-family: Arial, sans-serif; background: #121212; color: #fff; padding: 15px; margin: 0; }
            .container { max-width: 700px; margin: 20px auto; background: #1e1e1e; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.6); }
            h1 { text-align: center; color: #00ff88; font-size: 26px; margin-bottom: 5px; }
            .subtitle { text-align: center; color: #aaa; font-size: 14px; margin-bottom: 25px; }
            h3 { color: #00ff88; border-bottom: 2px solid #2a2a2a; padding-bottom: 6px; margin-top: 30px; font-size: 18px; }
            label { display: block; margin: 12px 0 5px; font-weight: bold; color: #ddd; font-size: 14px; }
            input, select { width: 100%; padding: 11px; border: 1px solid #333; background: #262626; color: #fff; border-radius: 6px; box-sizing: border-box; font-size: 15px; }
            input:focus, select:focus { border-color: #00ff88; outline: none; }
            
            .grid-emotes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #262626; padding: 12px; border-radius: 6px; border: 1px solid #333; }
            .checkbox-item { display: flex; align-items: center; background: #1e1e1e; padding: 8px; border-radius: 4px; border: 1px solid #2a2a2a; }
            .checkbox-item input { width: auto; margin-right: 10px; transform: scale(1.2); }
            .checkbox-item label { margin: 0; cursor: pointer; flex: 1; }

            .grid-rewards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #262626; padding: 12px; border-radius: 6px; border: 1px solid #333; }
            .reward-box { background: #1e1e1e; padding: 8px; border-radius: 4px; border: 1px solid #2a2a2a; text-align: center; }
            .reward-box label { font-size: 12px; margin: 0 0 4px 0; color: #00ff88; }
            .reward-box input { padding: 6px; text-align: center; font-size: 14px; }

            .round-container { background: #262626; padding: 15px; border-radius: 8px; border: 1px solid #333; margin-bottom: 15px; }
            
            button { width: 100%; padding: 15px; margin-top: 35px; background: #00ff88; border: none; color: #000; font-weight: bold; font-size: 17px; border-radius: 6px; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,255,136,0.2); }
            button:hover { background: #00cc6e; transform: translateY(-1px); }
            #status { margin-top: 20px; text-align: center; font-weight: bold; font-size: 15px; padding: 10px; border-radius: 6px; }
            
            @media(max-width: 600px) {
                .grid-emotes { grid-template-columns: 1fr; }
                .grid-rewards { grid-template-columns: 1fr 1fr; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Painel do Evento BoxerBone</h1>
            <div class="subtitle">Configuração de Torneios com Suporte a Todos os Mapas</div>
            
            <form id="tournamentForm">
                
                <h3>🖼️ Design e Identificação</h3>
                <label for="title">Nome Geral do Torneio:</label>
                <input type="text" id="title" required>

                <label for="imageUrl">Link do Banner/Imagem (URL):</label>
                <input type="url" id="imageUrl" placeholder="https://imgur.com/exemplo.png" required>

                <label for="maxPlayers">Limite Máximo de Jogadores Totais:</label>
                <input type="number" id="maxPlayers" min="2" max="100" required>

                <h3>🔄 Configuração das Fases (Rounds)</h3>
                
                <div class="round-container">
                    <strong style="color: #ffaa00;">Fase 1 (Round 1)</strong>
                    <label for="round1_map">Mapa:</label>
                    <select id="round1_map" class="map-selector"></select>
                    
                    <label for="round1_qualifiers">Jogadores que Classificam neste Round:</label>
                    <input type="number" id="round1_qualifiers" min="1" value="16" required>
                </div>

                <div class="round-container">
                    <strong style="color: #ffaa00;">Fase 2 (Round 2)</strong>
                    <label for="round2_map">Mapa:</label>
                    <select id="round2_map" class="map-selector"></select>
                    
                    <label for="round2_qualifiers">Jogadores que Classificam neste Round:</label>
                    <input type="number" id="round2_qualifiers" min="1" value="8" required>
                </div>

                <div class="round-container">
                    <strong style="color: #ffaa00;">Fase 3 (Round 3 - Final)</strong>
                    <label for="round3_map">Mapa da Grande Final:</label>
                    <select id="round3_map" class="map-selector"></select>
                </div>

                <h3>🎭 Grade de Emotes Especiais (Inventário Completo)</h3>
                <div class="grid-emotes">
                    <div class="checkbox-item"><input type="checkbox" id="em_punch"><label for="em_punch">Soco (Punch)</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="em_kick"><label for="em_kick">Rasteira (Kick)</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="em_hug"><label for="em_hug">Abraço (Hug)</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="em_heart"><label for="em_heart">Coração (Heart)</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="em_banana"><label for="em_banana">Banana</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="em_fire_punch"><label for="em_fire_punch">Soco de Fogo</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="em_golden_banana"><label for="em_golden_banana">Banana de Ouro</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="em_wet_kick"><label for="em_wet_kick">Rasteira Elétrica (Wet)</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="em_charged_hug"><label for="em_charged_hug">Abraço de Choque</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="em_mrbeast"><label for="em_mrbeast">Maleta MrBeast</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="em_ball"><label for="em_ball">Bola de Vôlei</label></div>
                    <div class="checkbox-item"><input type="checkbox" id="em_invisibility"><label for="em_invisibility">Invisibilidade</label></div>
                </div>

                <h3>💎 Premiação do Top 1 ao Top 16 (Gemas)</h3>
                <div class="grid-rewards" id="rewardsContainer"></div>

                <label for="statusSelect">Status de Publicação do Torneio:</label>
                <select id="statusSelect">
                    <option value="active">Ativo (Liberado no Menu do Jogo)</option>
                    <option value="hidden">Oculto (Manutenção)</option>
                </select>

                <button type="submit">🚀 Gravar Alterações e Atualizar GitHub</button>
            </form>
            <div id="status">Carregando dados da nuvem...</div>
        </div>

        <script>
            // Lista com todos os 19 mapas fornecidos
            const mapsList = [
                { id: "level1_whirly", name: "Spin go round" },
                { id: "level2_tile", name: "Tile Fall" },
                { id: "level3_ice", name: "Icy Height" },
                { id: "level4_pushy", name: "Humble Stumble" },
                { id: "level5_pivot", name: "Pivot Push" },
                { id: "level6_hill", name: "Cannon Climb" },
                { id: "level7_moving", name: "Over Under" },
                { id: "level8_honey", name: "Honey Drop" },
                { id: "level9_seesaw", name: "Floor Flip" },
                { id: "level10_soccer", name: "Stumble Soccer" },
                { id: "level11_lava", name: "Lava Rush" },
                { id: "level12_bomb", name: "Bombardment" },
                { id: "level13_gravity", name: "Space Race" },
                { id: "level14_slide", name: "Super Slide" },
                { id: "level15_laser", name: "Laser Tracer" },
                { id: "level16_temple", name: "Lost Temple" },
                { id: "level17_rocket", name: "Rocket" },
                { id: "level18_jungle", name: "Jungle Roll" },
                { id: "level19_block", name: "Block Dash" }
            ];

            // Injeta as opções de mapa dinamicamente nos seletores de round
            document.querySelectorAll('.map-selector').forEach(select => {
                mapsList.forEach(map => {
                    const opt = document.createElement('option');
                    opt.value = map.id;
                    opt.innerText = \`\${map.name} (\${map.id})\`;
                    select.appendChild(opt);
                });
            });

            // Criar os 16 campos de premiação
            const rewardsContainer = document.getElementById('rewardsContainer');
            for (let i = 1; i <= 16; i++) {
                rewardsContainer.innerHTML += \`
                    <div class="reward-box">
                        <label>TOP \${i}</label>
                        <input type="number" id="top\${i}" min="0" value="0" required>
                    </div>
                \`;
            }

            const emoteIds = [
                'punch', 'kick', 'hug', 'heart', 'banana', 'fire_punch', 
                'golden_banana', 'wet_kick', 'charged_hug', 'mrbeast', 'ball', 'invisibility'
            ];

            async function loadData() {
                try {
                    const res = await fetch('/api/tournament');
                    if (res.ok) {
                        const data = await res.json();
                        document.getElementById('title').value = data.title || '';
                        document.getElementById('imageUrl').value = data.imageUrl || '';
                        document.getElementById('maxPlayers').value = data.maxPlayers || 32;
                        document.getElementById('statusSelect').value = data.status || 'active';
                        
                        if (data.fases) {
                            document.getElementById('round1_map').value = data.fases.round1?.map || 'level19_block';
                            document.getElementById('round1_qualifiers').value = data.fases.round1?.qualifiers || 16;
                            document.getElementById('round2_map').value = data.fases.round2?.map || 'level19_block';
                            document.getElementById('round2_qualifiers').value = data.fases.round2?.qualifiers || 8;
                            document.getElementById('round3_map').value = data.fases.round3?.map || 'level19_block';
                        }

                        const allowedEmotes = data.allowedEmotes || [];
                        emoteIds.forEach(id => {
                            document.getElementById('em_' + id).checked = allowedEmotes.includes(id);
                        });

                        for (let i = 1; i <= 16; i++) {
                            document.getElementById('top' + i).value = data.rewards?.\`top\${i}\` || 0;
                        }

                        document.getElementById('status').innerText = 'Todos os dados e mapas carregados!';
                        document.getElementById('status').style.background = '#00ff8822';
                        document.getElementById('status').style.color = '#00ff88';
                    } else {
                        document.getElementById('status').innerText = 'Nenhum arquivo encontrado. Crie um novo!';
                        document.getElementById('status').style.background = '#ffaa0022';
                        document.getElementById('status').style.color = '#ffaa00';
                    }
                } catch (err) {
                    document.getElementById('status').innerText = 'Erro de sincronização local.';
                    document.getElementById('status').style.color = '#ff3333';
                }
            }

            document.getElementById('tournamentForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                document.getElementById('status').innerText = 'Sincronizando com o GitHub...';
                document.getElementById('status').style.background = '#ffaa0022';
                document.getElementById('status').style.color = '#ffaa00';

                const allowedEmotes = [];
                emoteIds.forEach(id => {
                    if (document.getElementById('em_' + id).checked) allowedEmotes.push(id);
                });

                const rewardsObj = {};
                for (let i = 1; i <= 16; i++) {
                    rewardsObj[\`top\${i}\`] = parseInt(document.getElementById('top' + i).value) || 0;
                }

                const updatedData = {
                    title: document.getElementById('title').value,
                    imageUrl: document.getElementById('imageUrl').value,
                    maxPlayers: parseInt(document.getElementById('maxPlayers').value),
                    fases: {
                        round1: {
                            map: document.getElementById('round1_map').value,
                            qualifiers: parseInt(document.getElementById('round1_qualifiers').value)
                        },
                        round2: {
                            map: document.getElementById('round2_map').value,
                            qualifiers: parseInt(document.getElementById('round2_qualifiers').value)
                        },
                        round3: {
                            map: document.getElementById('round3_map').value
                        }
                    },
                    rewards: rewardsObj,
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
                        document.getElementById('status').innerText = '✓ Sucesso! Mapas e dados gravados no repositório.';
                        document.getElementById('status').style.background = '#00ff8822';
                        document.getElementById('status').style.color = '#00ff88';
                    } else {
                        document.getElementById('status').innerText = 'Erro: ' + result.error;
                        document.getElementById('status').style.color = '#ff3333';
                    }
                } catch (err) {
                    document.getElementById('status').innerText = 'Erro de rede ao salvar.';
                    document.getElementById('status').style.color = '#ff3333';
                }
            });

            loadData();
        </script>
    </body>
    </html>
    `);
});

app.get('/api/tournament', (req: Request, res: Response) => {
    try {
        if (!fs.existsSync(tournamentFilePath)) {
            return res.status(404).json({ error: 'Arquivo do torneio vazio.' });
        }
        const fileData = fs.readFileSync(tournamentFilePath, 'utf-8');
        return res.json(JSON.parse(fileData));
    } catch (error) {
        return res.status(500).json({ error: 'Falha ao ler dados.' });
    }
});

app.post('/api/tournament/save', async (req: Request, res: Response) => {
    const newData = req.body;
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const gitFilePath = process.env.GITHUB_FILE_PATH || 'src/tournament.json';

    if (!token || !repo) {
        return res.status(500).json({ error: 'Variáveis de ambiente ausentes no Render.' });
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
            message: 'Painel Admin: Atualização completa da lista de mapas e rounds',
            content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
            sha: sha || undefined,
            branch: branch
        };

        const updateRes = await fetch(url, {
            method: 'PUT',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(commitBody)
        });

        if (!updateRes.ok) throw new Error('Falha ao commitar nova estrutura no repositório.');

        return res.json({ success: true, message: 'Dados sincronizados com sucesso no GitHub!' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log(`Servidor rodando com a lista completa de mapas na porta ${port}`));
