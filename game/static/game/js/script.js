(function () {
  const inputJogadores = document.getElementById("numero-jogadores");
  const inputImpostores = document.getElementById("numero-impostores");

  const modal = document.getElementById("modal");
  const areaJogo = document.getElementById("area-jogo");
  const btnFechar = document.getElementById("btn-fechar");

  const estadoInicial = document.getElementById("estado-inicial");
  const estadoParticipante = document.getElementById("estado-participante");
  const estadoRevelado = document.getElementById("estado-revelado");
  const estadoFim = document.getElementById("estado-fim");

  const participanteNome = document.getElementById("participante-nome");
  const jogadorCard = document.getElementById("jogador-card");
  const jogadorFoto = document.getElementById("jogador-foto");
  const jogadorNome = document.getElementById("jogador-nome");
  const jogadorDicas = document.getElementById("jogador-dicas");
  const viewNaoImpostor = document.getElementById("view-nao-impostor");
  const viewImpostor = document.getElementById("view-impostor");
  const btnPassarTexto = document.getElementById("btn-passar-texto");

  const participantes = [];
  let indiceAtual = 0;

  function ajustarCampos() {
    let qtdJogadores = parseInt(inputJogadores.value) || 0;
    let qtdImpostores = parseInt(inputImpostores.value) || 0;

    if (qtdJogadores > 0 && qtdImpostores >= qtdJogadores) {
      qtdImpostores = Math.max(qtdJogadores - 1, 1);
      inputImpostores.value = qtdImpostores;
    }
  }

  function verificarMinimos() {
    let qtdJogadores = parseInt(inputJogadores.value) || 0;
    let qtdImpostores = parseInt(inputImpostores.value) || 0;

    if (qtdJogadores < 3) {
      inputJogadores.value = 3;
    }
    if (qtdImpostores < 1) {
      inputImpostores.value = 1;
    }

    ajustarCampos();
  }

  inputJogadores.addEventListener("input", ajustarCampos);
  inputImpostores.addEventListener("input", ajustarCampos);
  inputJogadores.addEventListener("blur", verificarMinimos);
  inputImpostores.addEventListener("blur", verificarMinimos);
  ajustarCampos();

  function mostrarApenas(el) {
    [estadoInicial, estadoParticipante, estadoRevelado, estadoFim].forEach(function (e) {
      e.classList.add("hidden");
    });
    el.classList.remove("hidden");
  }

  function sortearJogadores(qtd) {
    const promises = [];
    for (let i = 0; i < qtd; i++) {
      promises.push(
        fetch("/", { headers: { "HX-Request": "true" } }).then(function (r) {
          if (!r.ok) throw new Error("Erro ao buscar jogador");
          return r.text();
        }).then(function (html) {
          const doc = new DOMParser().parseFromString(html, "text/html");
          const el = doc.body.firstElementChild;
          return {
            nome: el.getAttribute("data-nome"),
            foto: el.getAttribute("data-foto"),
            dicas: el.getAttribute("data-dicas"),
          };
        })
      );
    }
    return Promise.all(promises);
  }

  function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  document.getElementById("btn-sortear").addEventListener("click", function () {
    const qtd = parseInt(inputJogadores.value) || 4;
    const qtdImp = parseInt(inputImpostores.value) || 1;

    sortearJogadores(qtd).then(function (jogadores) {
      participantes.length = 0;
      indiceAtual = 0;

      const indices = embaralhar([...Array(qtd).keys()]);
      const impSet = new Set(indices.slice(0, qtdImp));

      for (let i = 0; i < qtd; i++) {
        participantes.push({
          numero: i + 1,
          jogador: jogadores[i],
          ehImpostor: impSet.has(i),
        });
      }

      mostrarParticipante();
    }).catch(function () {
      mostrarApenas(estadoInicial);
    });
  });

  function mostrarParticipante() {
    const p = participantes[indiceAtual];
    participanteNome.textContent = "Participante " + p.numero;
    btnPassarTexto.textContent = "Passar";
    mostrarApenas(estadoParticipante);
  }

  document.getElementById("btn-mostrar").addEventListener("click", function () {
    const p = participantes[indiceAtual];

    if (p.ehImpostor) {
      jogadorDicas.textContent = p.jogador.dicas;
      viewNaoImpostor.classList.add("hidden");
      viewImpostor.classList.remove("hidden");
    } else {
      jogadorFoto.src = p.jogador.foto;
      jogadorFoto.alt = p.jogador.nome;
      jogadorNome.textContent = p.jogador.nome;
      viewImpostor.classList.add("hidden");
      viewNaoImpostor.classList.remove("hidden");
    }

    const ehUltimo = indiceAtual === participantes.length - 1;
    btnPassarTexto.textContent = ehUltimo ? "Finalizar" : "Passar";

    mostrarApenas(estadoRevelado);
  });

  document.getElementById("btn-passar").addEventListener("click", function () {
    if (indiceAtual < participantes.length - 1) {
      indiceAtual++;
      mostrarParticipante();
    } else {
      mostrarApenas(estadoFim);
      btnFechar.classList.remove("hidden");
    }
  });

  function resetarJogo() {
    mostrarApenas(estadoInicial);
    btnFechar.classList.add("hidden");
  }

  modal.addEventListener("close", resetarJogo);
})();
