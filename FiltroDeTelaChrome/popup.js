document.addEventListener('DOMContentLoaded', () => {
  const brilho = document.getElementById('brilho');
  const contraste = document.getElementById('contraste');
  const nitidez = document.getElementById('nitidez');
  const cor = document.getElementById('cor');
  const btnReset = document.getElementById('resetar');

  const valBrilho = document.getElementById('val-brilho');
  const valContraste = document.getElementById('val-contraste');
  const valNitidez = document.getElementById('val-nitidez');

  // Atualiza os valores visuais e envia para a página
  function updateFilters() {
    valBrilho.textContent = brilho.value;
    valContraste.textContent = contraste.value;
    valNitidez.textContent = nitidez.value;

    const config = {
      brilho: brilho.value,
      contraste: contraste.value,
      nitidez: nitidez.value,
      cor: cor.value
    };

    // Salva as configurações localmente
    chrome.storage.local.set(config);

    // Envia o script para a aba ativa
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: aplicarFiltrosNaPagina,
        args: [config]
      });
    });
  }

  // Carrega configurações salvas
  chrome.storage.local.get(['brilho', 'contraste', 'nitidez', 'cor'], (data) => {
    if (data.brilho) brilho.value = data.brilho;
    if (data.contraste) contraste.value = data.contraste;
    if (data.nitidez) nitidez.value = data.nitidez;
    if (data.cor) cor.value = data.cor;
    updateFilters();
  });

  // Event Listeners
  brilho.addEventListener('input', updateFilters);
  contraste.addEventListener('input', updateFilters);
  nitidez.addEventListener('input', updateFilters);
  cor.addEventListener('change', updateFilters);

  btnReset.addEventListener('click', () => {
    brilho.value = 100;
    contraste.value = 100;
    nitidez.value = 0;
    cor.value = 'transparent';
    updateFilters();
  });
});

// Esta função será injetada e executada no contexto da página web
function aplicarFiltrosNaPagina(config) {
  // 1. Aplica Brilho, Contraste e simulação de nitidez
  let htmlElement = document.documentElement;
  // A nitidez está sendo simulada com um leve aumento de contraste nativo para textos
  let nitidezAjuste = config.nitidez > 0 ? ` contrast(${100 + (config.nitidez * 2)}%)` : "";
  htmlElement.style.filter = `brightness(${config.brilho}%) contrast(${config.contraste}%)${nitidezAjuste}`;

  // 2. Aplica o filtro de cor (Multiply)
  let overlay = document.getElementById('extensao-filtro-cor-overlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'extensao-filtro-cor-overlay';
    // Estilos cruciais para o overlay
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.pointerEvents = 'none'; // Permite clicar através da cor
    overlay.style.zIndex = '2147483647'; // Fica por cima de tudo
    overlay.style.mixBlendMode = 'multiply'; // O segredo para o efeito
    document.body.appendChild(overlay);
  }

  // Aplica a cor selecionada (se for cinza, usamos grayscale direto no HTML ou aplicamos um fundo cinza)
  if(config.cor.includes('128')) {
      // Efeito cinza fica melhor usando blend mode 'color' ou saturação 0
      overlay.style.mixBlendMode = 'color';
  } else {
      overlay.style.mixBlendMode = 'multiply';
  }
  
  overlay.style.backgroundColor = config.cor;
}