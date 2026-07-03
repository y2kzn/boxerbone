import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Caminho do arquivo de torneio local
const tournamentFilePath = path.join(__dirname, 'tournament.json');

// Rota para ler os dados do torneio
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

// Rota para salvar e commitar alterações de volta no GitHub
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
        // 1. Atualiza localmente no servidor do Render primeiro
        fs.writeFileSync(tournamentFilePath, JSON.stringify(newData, null, 2), 'utf-8');

        // 2. Busca o SHA do arquivo atual no GitHub (necessário para dar update)
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

        // 3. Envia o commit de atualização para o GitHub
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

        return res.json({ success: true, message: 'Dados salvos localmente e sincronizados com o GitHub!' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message || 'Falha ao sincronizar dados com o GitHub.' });
    }
});

app.listen(port, () => {
    console.log(`Servidor TS rodando com sucesso na porta ${port}`);
});
