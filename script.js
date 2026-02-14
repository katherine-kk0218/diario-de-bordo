let numMissoes = 2;
let modoAdmin = false;
const SENHA_MESTRA = "clave123";
const SEU_WHATSAPP = "5551998895851"; // Coloque seu número com DDD e sem espaços

let dadosDiario = {
    hino: "Clique para definir",
    missoes: ["Missão 01", "Missão 02"]
};

let progressoAluna = {
    checks: [],
    medalhas: [false, false, false, false, false]
};

const somClick = document.getElementById('som-click');
const somSucesso = document.getElementById('som-sucesso');
const musicaFundo = document.getElementById('musica-fundo');
let audioIniciado = false;

function iniciarAudioAutomatico() {
    if (!audioIniciado) {
        musicaFundo.volume = 0.10;
        musicaFundo.play();
        audioIniciado = true;
    }
}

function acessoProfessora() {
    const senha = prompt("Senha da Professora:");
    if (senha === SENHA_MESTRA) {
        modoAdmin = true;
        document.getElementById('controles-admin').classList.remove('hidden');
        document.getElementById('btn-salvar').classList.remove('hidden');
        document.getElementById('nome-hino').contentEditable = true;
        document.getElementById('btn-admin').innerText = "🔓 Modo Edição Ativo";
        renderizarMissoes();
    }
}

function ajustarMissoes(valor) {
    numMissoes = Math.max(1, Math.min(4, numMissoes + valor));
    renderizarMissoes();
}

function renderizarMissoes() {
    const container = document.getElementById('lista-tarefas');
    container.innerHTML = '';
    for (let i = 0; i < numMissoes; i++) {
        let texto = dadosDiario.missoes[i] || "";
        let isChecked = progressoAluna.checks[i] ? 'checked' : '';
        container.innerHTML += `
            <div class="tarefa-item">
                <input type="checkbox" class="check-missao" ${isChecked} onchange="marcarMissao(${i}, this.checked)">
                <span class="texto-missao" contenteditable="${modoAdmin}">${texto}</span>
            </div>
        `;
    }
    atualizarMedalhasVisuais();
    atualizarProgresso(false);
}

function marcarMissao(index, valor) {
    progressoAluna.checks[index] = valor;
    localStorage.setItem('progresso_aluna', JSON.stringify(progressoAluna));
    atualizarProgresso(true);
}

function toggleMedalha(index) {
    progressoAluna.medalhas[index] = !progressoAluna.medalhas[index];
    somClick.play();
    localStorage.setItem('progresso_aluna', JSON.stringify(progressoAluna));
    atualizarMedalhasVisuais();
    atualizarProgresso(true);
}

function atualizarMedalhasVisuais() {
    const medalhasDOM = document.querySelectorAll('.medalha');
    progressoAluna.medalhas.forEach((ativa, i) => {
        if(ativa) medalhasDOM[i].classList.add('ativa');
        else medalhasDOM[i].classList.remove('ativa');
    });
}

function atualizarProgresso(comSom) {
    const concluidas = progressoAluna.checks.filter(c => c).length;
    const medalhasAtivas = progressoAluna.medalhas.filter(m => m).length;
    
    // 60% missões / 40% medalhas
    let total = Math.round((concluidas / numMissoes * 60) + (medalhasAtivas / 5 * 40));
    if (isNaN(total)) total = 0;

    document.getElementById('barra-progresso').style.width = total + '%';
    document.getElementById('percentual').innerText = total + '%';
    
    if(total >= 100 && comSom) {
        dispararConfete();
        somSucesso.play();
    }
}

function compartilharWhatsApp() {
    const total = document.getElementById('percentual').innerText;
    const dadosBase64 = btoa(JSON.stringify(progressoAluna));
    const linkProgresso = window.location.origin + window.location.pathname + "?p=" + dadosBase64;
    
    const texto = `Oi Karine! Completei minhas missões do Diário de Bordo. Meu progresso atual é de ${total}%! 🏅\n\nAqui o link do meu progresso: ${linkProgresso}`;
    window.open(`https://wa.me/${SEU_WHATSAPP}?text=${encodeURIComponent(texto)}`);
}

function salvarConfiguracao() {
    dadosDiario.hino = document.getElementById('nome-hino').innerText;
    dadosDiario.missoes = Array.from(document.querySelectorAll('.texto-missao')).map(s => s.innerText);
    localStorage.setItem('config_semanal_clave', JSON.stringify(dadosDiario));
    alert("Missões da semana salvas!");
    location.reload();
}

function carregarTudo() {
    const config = localStorage.getItem('config_semanal_clave');
    if(config) {
        dadosDiario = JSON.parse(config);
        numMissoes = dadosDiario.missoes.length;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const paramP = urlParams.get('p');
    
    if(paramP) {
        progressoAluna = JSON.parse(atob(paramP));
    } else {
        const salvo = localStorage.getItem('progresso_aluna');
        if(salvo) progressoAluna = JSON.parse(salvo);
    }

    document.getElementById('nome-hino').innerText = dadosDiario.hino;
    renderizarMissoes();
}

function dispararConfete() {
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#2D9CDB', '#FEC601', '#9B51E0'] });
}


window.onload = carregarTudo;
