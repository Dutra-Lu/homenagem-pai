const secoes = document.querySelectorAll('.painel');
const dotsWrap = document.getElementById('dots');

secoes.forEach((secao, i) => {
  const ponto = document.createElement('a');
  ponto.href = `#${secao.id}`;
  if (i === 0) ponto.classList.add('ativo');
  dotsWrap.appendChild(ponto);
});

const pontos = dotsWrap.querySelectorAll('a');

const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      const indice = [...secoes].indexOf(entrada.target);
      pontos.forEach(p => p.classList.remove('ativo'));
      pontos[indice].classList.add('ativo');
    }
  });
}, { threshold: 0.5 });

secoes.forEach(secao => observador.observe(secao));

document.querySelectorAll('.seta-nav').forEach(seta => {
  seta.addEventListener('click', () => {
    const alvo = seta.getAttribute('data-proximo');
    if (!alvo) return;
    const destino = document.getElementById(alvo);
    if (destino) destino.scrollIntoView({ behavior: 'smooth' });
  });
});

const trilha = document.getElementById('trilha');
const btnSom = document.getElementById('btn-som');
let tocandoPorVontade = false;

btnSom.addEventListener('click', () => {
  if (trilha.paused) {
    trilha.play();
    tocandoPorVontade = true;
    btnSom.textContent = '🔊 pausar som';
    btnSom.setAttribute('aria-pressed', 'true');
  } else {
    trilha.pause();
    tocandoPorVontade = false;
    btnSom.textContent = '🔈 ativar som';
    btnSom.setAttribute('aria-pressed', 'false');
  }
});

const extensoesVideo = ['mp4', 'webm', 'mov', 'ogg'];

function ehVideo(caminho) {
  const ext = caminho.split('.').pop().toLowerCase();
  return extensoesVideo.includes(ext);
}

function inserirMidia(slot, caminho, forcarVideo) {
  const legenda = slot.getAttribute('data-legenda') || '';
  const posicao = slot.getAttribute('data-posicao') || 'center';

  if (forcarVideo === true || (forcarVideo === undefined && ehVideo(caminho))) {
    const video = document.createElement('video');
    video.src = caminho;
    video.controls = true;
    video.playsInline = true;
    video.style.objectPosition = posicao;

    if (slot.closest('.carrossel')) {
      video.muted = true;
      video.autoplay = true;
    }

    slot.appendChild(video);
    if (video.autoplay) video.play().catch(() => {});
  } else {
    const img = document.createElement('img');
    img.src = caminho;
    img.alt = legenda;
    img.style.objectPosition = posicao;
    slot.appendChild(img);
  }
}

const carrossel = document.getElementById('carrossel-habilidades');
if (carrossel) {
  const slides = [...carrossel.querySelectorAll('.carrossel-slide')];
  const legenda = document.getElementById('carrossel-legenda');
  let indiceAtual = 0;

  slides.forEach(slide => {
    const caminho = slide.getAttribute('data-src');
    if (caminho) inserirMidia(slide, caminho);
  });

  function mostrarSlide(indice) {
    slides[indiceAtual].classList.remove('ativo');
    indiceAtual = (indice + slides.length) % slides.length;
    slides[indiceAtual].classList.add('ativo');
    legenda.textContent = slides[indiceAtual].getAttribute('data-legenda') || '';

    const videoNovo = slides[indiceAtual].querySelector('video');
    if (videoNovo) videoNovo.play().catch(() => {});
  }

  const secaoCarrossel = carrossel.closest('.painel');
  if (secaoCarrossel) {
    const observadorCarrossel = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        const videoAtivo = slides[indiceAtual].querySelector('video');
        if (!videoAtivo) return;
        if (entrada.isIntersecting) videoAtivo.play().catch(() => {});
        else videoAtivo.pause();
      });
    }, { threshold: 0.5 });
    observadorCarrossel.observe(secaoCarrossel);
  }

  document.getElementById('carrossel-anterior').addEventListener('click', () => {
    pausarVideosDoCarrossel();
    mostrarSlide(indiceAtual - 1);
  });

  document.getElementById('carrossel-proxima').addEventListener('click', () => {
    pausarVideosDoCarrossel();
    mostrarSlide(indiceAtual + 1);
  });

  function pausarVideosDoCarrossel() {
    carrossel.querySelectorAll('video').forEach(v => v.pause());
  }

  legenda.textContent = slides[0].getAttribute('data-legenda') || '';

  document.addEventListener('keydown', (e) => {
    if (e.code !== 'ArrowLeft' && e.code !== 'ArrowRight') return;
    const foco = document.activeElement;
    const digitando = foco && (foco.tagName === 'INPUT' || foco.tagName === 'TEXTAREA' || foco.isContentEditable);
    if (digitando) return;

    pausarVideosDoCarrossel();
    if (e.code === 'ArrowLeft') mostrarSlide(indiceAtual - 1);
    else mostrarSlide(indiceAtual + 1);
  });
}

document.querySelectorAll('.foto-slot').forEach(slot => {
  const caminho = slot.getAttribute('data-src');
  if (caminho) inserirMidia(slot, caminho);
});

const fotoHero = document.getElementById('foto-hero');
if (fotoHero) {
  const caminho = fotoHero.getAttribute('data-src');
  if (caminho) inserirMidia(fotoHero, caminho);
}

document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space') return;

  const foco = document.activeElement;
  const digitando = foco && (foco.tagName === 'INPUT' || foco.tagName === 'TEXTAREA' || foco.isContentEditable);
  if (digitando) return;

  const videos = [...document.querySelectorAll('video')];
  const videoVisivel = videos.find(v => {
    const retangulo = v.getBoundingClientRect();
    return retangulo.bottom > 0 && retangulo.top < window.innerHeight && retangulo.width > 0;
  });

  if (!videoVisivel) return;

  e.preventDefault();
  if (videoVisivel.paused) {
    videoVisivel.play();
  } else {
    videoVisivel.pause();
  }
});

document.querySelectorAll('.foto-slot').forEach(slot => {
  slot.addEventListener('click', () => {
    if (slot.querySelector('img')) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = (e) => {
      const arquivo = e.target.files[0];
      if (!arquivo) return;
      const url = URL.createObjectURL(arquivo);
      inserirMidia(slot, url, arquivo.type.startsWith('video'));
    };
    input.click();
  });
});

const irritacaoItens = [...document.querySelectorAll('.irritacao-item')].map(el => el.textContent.trim());
const irritacaoCartao = document.getElementById('irritacao-cartao');
const irritacaoNumero = document.getElementById('irritacao-numero');
const irritacaoTexto = document.getElementById('irritacao-texto');
const botaoIrritacao = document.getElementById('botao-irritacao');
const botaoIrritacaoTexto = document.getElementById('botao-irritacao-texto');
const frasesBotaoIrritacao = ['bota mais uma ', 'aguenta mais essa ', 'prepara que vem mais ', 'é sério, tem mais ', 'última, prometo (mentira) '];
let indiceIrritacao = 0;

function mostrarIrritacao(indice) {
  irritacaoNumero.textContent = String(indice + 1).padStart(2, '0');
  irritacaoTexto.textContent = irritacaoItens[indice];
  irritacaoCartao.classList.remove('animar');
  void irritacaoCartao.offsetWidth;
  irritacaoCartao.classList.add('animar');
}

if (irritacaoItens.length && irritacaoCartao) {
  mostrarIrritacao(0);

  botaoIrritacao.addEventListener('click', () => {
    indiceIrritacao = (indiceIrritacao + 1) % irritacaoItens.length;
    mostrarIrritacao(indiceIrritacao);
    botaoIrritacaoTexto.textContent = frasesBotaoIrritacao[indiceIrritacao % frasesBotaoIrritacao.length];
  });
}

document.querySelectorAll('[data-fundo]').forEach(secao => {
  const fundo = secao.getAttribute('data-fundo');
  secao.classList.add('fundo-desfocado');
  secao.style.setProperty('--fundo-url', `url(${fundo})`);
});

const btnAssistir = document.getElementById('btn-assistir');
const modalVideo = document.getElementById('modal-video');
const modalPlayer = document.getElementById('modal-video-player');
const modalFechar = document.getElementById('modal-fechar');

function abrirModalVideo() {
  const caminho = btnAssistir.getAttribute('data-src');
  modalPlayer.src = caminho;
  modalVideo.classList.add('aberto');
  modalPlayer.play().catch(() => {});
  if (!trilha.paused) trilha.pause();
}

function fecharModalVideo() {
  modalVideo.classList.remove('aberto');
  modalPlayer.pause();
  modalPlayer.currentTime = 0;
  modalPlayer.removeAttribute('src');
  modalPlayer.load();
  if (tocandoPorVontade) trilha.play();
}

if (btnAssistir) {
  btnAssistir.addEventListener('click', abrirModalVideo);
}

if (modalFechar) {
  modalFechar.addEventListener('click', fecharModalVideo);
}

if (modalVideo) {
  modalVideo.addEventListener('click', (e) => {
    if (e.target === modalVideo) fecharModalVideo();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape' && modalVideo && modalVideo.classList.contains('aberto')) {
    fecharModalVideo();
  }
});
const secaoFesta = document.getElementById('s8');
const confete = document.getElementById('confete');
const botaoFinal = document.getElementById('botao-final');
const festaFechar = document.getElementById('festa-fechar');
const emojisFesta = ['🍺', '🍻', '🎉', '🥳', '🔥', '🎂', '🪩'];

function soltarConfete() {
  confete.innerHTML = '';
  for (let i = 0; i < 28; i++) {
    const item = document.createElement('span');
    item.textContent = emojisFesta[Math.floor(Math.random() * emojisFesta.length)];
    item.style.left = Math.random() * 100 + '%';
    item.style.animationDuration = 3 + Math.random() * 3 + 's';
    item.style.animationDelay = 2.2 + Math.random() * 2.5 + 's';
    confete.appendChild(item);
  }
}

function abrirFesta() {
  secaoFesta.classList.add('aberto');
  void secaoFesta.offsetWidth;
  secaoFesta.classList.add('ativo');
  document.body.style.overflow = 'hidden';
  soltarConfete();
}

function fecharFesta() {
  secaoFesta.classList.remove('ativo', 'aberto');
  document.body.style.overflow = '';
  confete.innerHTML = '';
}

if (secaoFesta && botaoFinal) {
  botaoFinal.addEventListener('click', abrirFesta);
  festaFechar.addEventListener('click', fecharFesta);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && secaoFesta.classList.contains('aberto')) {
      fecharFesta();
    }
  });
}