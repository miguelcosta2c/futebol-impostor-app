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
  const checkMostrarDica = document.getElementById("mostrar-dica");

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

  function salvarConfiguracoes() {
    const nomeInputs = document.querySelectorAll("#inputs-nomes input");
    const nomes = Array.from(nomeInputs).map((inp) => inp.value);

    const cats = document.querySelectorAll('input[name="categoria"]:checked');
    const categoriasMarcadas = Array.from(cats).map((c) => c.value);

    const dados = {
      jogadores: inputJogadores.value,
      impostores: inputImpostores.value,
      mostrarDica: checkMostrarDica.checked,
      nomesParticipantes: nomes,
      categorias: categoriasMarcadas,
    };

    localStorage.setItem("futebol_impostor_config", JSON.stringify(dados));
  }

  function carregarConfiguracoes() {
    const dadosSalvos = localStorage.getItem("futebol_impostor_config");
    if (!dadosSalvos) return;

    try {
      const dados = JSON.parse(dadosSalvos);

      inputJogadores.value = dados.jogadores || 4;
      inputImpostores.value = dados.impostores || 1;
      checkMostrarDica.checked = dados.mostrarDica !== false; // Padrão true se não existir

      ajustarCampos();
      gerarInputsNomes(parseInt(inputJogadores.value) || 3);

      if (dados.nomesParticipantes) {
        const nomeInputs = document.querySelectorAll("#inputs-nomes input");
        nomeInputs.forEach(function (inp, i) {
          if (dados.nomesParticipantes[i] !== undefined) {
            inp.value = dados.nomesParticipantes[i];
          }
        });
      }

      if (dados.categorias) {
        const cats = document.querySelectorAll('input[name="categoria"]');
        cats.forEach(function (c) {
          c.checked = dados.categorias.includes(c.value);
        });
      }
    } catch (e) {
      console.error("Erro ao carregar configurações salvas:", e);
    }
  }

  inputJogadores.addEventListener("input", function () {
    ajustarCampos();
    gerarInputsNomes(parseInt(inputJogadores.value) || 3);
    salvarConfiguracoes();
  });
  inputImpostores.addEventListener("input", function () {
    ajustarCampos();
    salvarConfiguracoes();
  });
  inputJogadores.addEventListener("blur", verificarMinimos);
  inputImpostores.addEventListener("blur", verificarMinimos);

  const containerNomes = document.getElementById("inputs-nomes");
  if (containerNomes) {
    containerNomes.addEventListener("input", salvarConfiguracoes);
  }

  checkMostrarDica.addEventListener("change", salvarConfiguracoes);

  document.addEventListener("change", function (e) {
    if (e.target && e.target.name === "categoria") {
      salvarConfiguracoes();
    }
  });

  function gerarInputsNomes(qtd) {
    const container = document.getElementById("inputs-nomes");
    if (!container) return;
    const inputs = container.querySelectorAll("input");
    const valores = [];
    inputs.forEach(function (inp, i) {
      valores[i] = inp.value;
    });
    container.innerHTML = "";
    for (let i = 0; i < qtd; i++) {
      const inp = document.createElement("input");
      inp.type = "text";
      inp.placeholder = "Participante " + (i + 1);
      inp.value = valores[i] || "";
      inp.className =
        "w-full py-1.5 px-2.5 text-sm rounded-lg border border-[var(--pitch-line)] bg-black/30 placeholder:text-[var(--chalk)]/40 focus:ring-2 focus:ring-[var(--led-amber)] outline-none transition-all";
      container.appendChild(inp);
    }
  }

  carregarConfiguracoes();

  if (!localStorage.getItem("futebol_impostor_config")) {
    ajustarCampos();
    gerarInputsNomes(parseInt(inputJogadores.value) || 3);
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-step]");
    if (!btn) return;
    const input = document.getElementById(btn.dataset.step);
    if (!input) return;
    const dir = parseInt(btn.dataset.dir) || 0;
    const valor = parseInt(input.value) || 0;
    const novoValor = Math.min(
      parseInt(input.max) || 999,
      Math.max(parseInt(input.min) || 1, valor + dir),
    );
    input.value = novoValor;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

  function mostrarApenas(el) {
    [estadoInicial, estadoParticipante, estadoRevelado, estadoFim].forEach(
      function (e) {
        e.classList.add("hidden");
      },
    );
    el.classList.remove("hidden");
  }

  function sortearJogador() {
    const cats = document.querySelectorAll('input[name="categoria"]:checked');
    const params = new URLSearchParams();
    if (cats.length > 0) {
      params.set(
        "categorias",
        Array.from(cats)
          .map(function (c) {
            return c.value;
          })
          .join(","),
      );
    }
    const url = "/?" + params.toString();
    return fetch(url, { headers: { "HX-Request": "true" } })
      .then(function (r) {
        if (!r.ok) throw new Error("Erro ao buscar jogador");
        return r.text();
      })
      .then(function (html) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const el = doc.body.firstElementChild;
        return {
          nome: el.getAttribute("data-nome"),
          foto: el.getAttribute("data-foto"),
          dicas: el.getAttribute("data-dicas"),
        };
      });
  }

  function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  document.getElementById("btn-sortear").addEventListener("click", function () {
    verificarMinimos();

    const qtd = parseInt(inputJogadores.value) || 4;
    const qtdImp = parseInt(inputImpostores.value) || 1;

    sortearJogador()
      .then(function (jogador) {
        participantes.length = 0;
        indiceAtual = 0;

        const nomeInputs = document.querySelectorAll("#inputs-nomes input");
        const nomes = [];
        nomeInputs.forEach(function (inp, i) {
          nomes[i] = inp.value.trim() || "Participante " + (i + 1);
        });

        const indices = embaralhar([...Array(qtd).keys()]);
        const impSet = new Set(indices.slice(0, qtdImp));

        for (let i = 0; i < qtd; i++) {
          participantes.push({
            numero: i + 1,
            nome: nomes[i] || "Participante " + (i + 1),
            jogador: jogador,
            ehImpostor: impSet.has(i),
          });
        }

        mostrarParticipante();
      })
      .catch(function () {
        mostrarApenas(estadoInicial);
      });
  });

  function mostrarParticipante() {
    const p = participantes[indiceAtual];
    participanteNome.textContent = p.nome;
    btnPassarTexto.textContent = "Passar";
    mostrarApenas(estadoParticipante);
  }

  document.getElementById("btn-mostrar").addEventListener("click", function () {
    const p = participantes[indiceAtual];

    if (p.ehImpostor) {
      jogadorDicas.textContent = checkMostrarDica.checked
        ? p.jogador.dicas
        : "Sem dica, tente adivinhar!";
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
