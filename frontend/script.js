/* ===================================================================
   Comunicação com a API REST e controle da interface
   =================================================================== */

const URL_API = "http://localhost:8080/api/usuarios";

// Elementos da página
const formulario = document.getElementById("formularioUsuario");
const tituloFormulario = document.getElementById("tituloFormulario");
const campoId = document.getElementById("usuarioId");
const botaoCancelar = document.getElementById("botaoCancelar");
const corpoTabela = document.getElementById("corpoTabela");
const areaAviso = document.getElementById("areaAviso");

// Elementos do modal de exclusão
const modal = document.getElementById("modalConfirmacao");
const textoModal = document.getElementById("textoModal");
const botaoConfirmarExclusao = document.getElementById("botaoConfirmarExclusao");
const botaoCancelarExclusao = document.getElementById("botaoCancelarExclusao");

// Guarda o ID do usuário que está prestes a ser excluído
let idParaExcluir = null;


/* ===================================================================
   Inicialização
   =================================================================== */

document.addEventListener("DOMContentLoaded", listarUsuarios);
formulario.addEventListener("submit", aoEnviarFormulario);
botaoCancelar.addEventListener("click", sairDoModoEdicao);
botaoCancelarExclusao.addEventListener("click", fecharModal);
botaoConfirmarExclusao.addEventListener("click", confirmarExclusao);


/* ===================================================================
   Listagem (GET /api/usuarios)
   =================================================================== */

async function listarUsuarios() {
    try {
        const resposta = await fetch(URL_API);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar a lista de usuários.");
        }

        const usuarios = await resposta.json();
        preencherTabela(usuarios);

    } catch (erro) {
        preencherTabela([]);
        exibirAviso("Não foi possível conectar à API. Verifique se o servidor está em execução.", "erro");
    }
}

function preencherTabela(usuarios) {
    corpoTabela.innerHTML = "";

    if (usuarios.length === 0) {
        corpoTabela.innerHTML = `
            <tr class="linha-vazia">
                <td colspan="8">Nenhum usuário cadastrado. Preencha o formulário acima para começar.</td>
            </tr>`;
        return;
    }

    usuarios.forEach(usuario => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${usuario.id}</td>
            <td>${escaparTexto(usuario.nome)}</td>
            <td>${escaparTexto(usuario.cpf)}</td>
            <td>${escaparTexto(usuario.email)}</td>
            <td>${escaparTexto(usuario.telefone)}</td>
            <td>${formatarData(usuario.dataNascimento)}</td>
            <td>${formatarDataHora(usuario.dataCadastro)}</td>
            <td>
                <button type="button" class="botao botao-secundario botao-tabela" data-acao="editar" data-id="${usuario.id}">Editar</button>
                <button type="button" class="botao botao-perigo botao-tabela" data-acao="excluir" data-id="${usuario.id}" data-nome="${escaparTexto(usuario.nome)}">Excluir</button>
            </td>`;
        corpoTabela.appendChild(linha);
    });

    // Liga os botões de cada linha às suas ações
    corpoTabela.querySelectorAll("[data-acao='editar']").forEach(botao => {
        botao.addEventListener("click", () => carregarParaEdicao(botao.dataset.id));
    });

    corpoTabela.querySelectorAll("[data-acao='excluir']").forEach(botao => {
        botao.addEventListener("click", () => abrirModal(botao.dataset.id, botao.dataset.nome));
    });
}


/* ===================================================================
   Cadastro e atualização (POST e PUT)
   =================================================================== */

async function aoEnviarFormulario(evento) {
    evento.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const dados = {
        nome: document.getElementById("nome").value.trim(),
        cpf: document.getElementById("cpf").value.trim(),
        email: document.getElementById("email").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        dataNascimento: document.getElementById("dataNascimento").value
    };

    const id = campoId.value;
    const estaEditando = id !== "";

    try {
        const resposta = await fetch(estaEditando ? `${URL_API}/${id}` : URL_API, {
            method: estaEditando ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const corpoErro = await resposta.json();
            exibirAviso(montarMensagemErro(corpoErro), "erro");
            return;
        }

        exibirAviso(estaEditando ? "Usuário atualizado." : "Usuário cadastrado.", "sucesso");
        sairDoModoEdicao();
        listarUsuarios();

    } catch (erro) {
        exibirAviso("Não foi possível concluir a operação. Verifique a conexão com a API.", "erro");
    }
}


/* ===================================================================
   Edição (GET /api/usuarios/{id})
   =================================================================== */

async function carregarParaEdicao(id) {
    try {
        const resposta = await fetch(`${URL_API}/${id}`);

        if (!resposta.ok) {
            exibirAviso("Usuário não encontrado.", "erro");
            listarUsuarios();
            return;
        }

        const usuario = await resposta.json();

        campoId.value = usuario.id;
        document.getElementById("nome").value = usuario.nome;
        document.getElementById("cpf").value = usuario.cpf;
        document.getElementById("email").value = usuario.email;
        document.getElementById("telefone").value = usuario.telefone;
        document.getElementById("dataNascimento").value = usuario.dataNascimento;

        tituloFormulario.textContent = `Editando usuário #${usuario.id}`;
        botaoCancelar.hidden = false;
        limparErros();
        window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (erro) {
        exibirAviso("Não foi possível carregar os dados do usuário.", "erro");
    }
}

function sairDoModoEdicao() {
    formulario.reset();
    campoId.value = "";
    tituloFormulario.textContent = "Novo usuário";
    botaoCancelar.hidden = true;
    limparErros();
}


/* ===================================================================
   Exclusão com confirmação (DELETE /api/usuarios/{id})
   =================================================================== */

function abrirModal(id, nome) {
    idParaExcluir = id;
    textoModal.textContent = `Excluir o usuário "${nome}"? Esta ação não pode ser desfeita.`;
    modal.hidden = false;
    botaoConfirmarExclusao.focus();
}

function fecharModal() {
    idParaExcluir = null;
    modal.hidden = true;
}

async function confirmarExclusao() {
    if (idParaExcluir === null) {
        return;
    }

    try {
        const resposta = await fetch(`${URL_API}/${idParaExcluir}`, { method: "DELETE" });

        if (!resposta.ok) {
            exibirAviso("Não foi possível excluir o usuário.", "erro");
        } else {
            exibirAviso("Usuário excluído.", "sucesso");
        }

    } catch (erro) {
        exibirAviso("Não foi possível concluir a exclusão. Verifique a conexão com a API.", "erro");
    } finally {
        fecharModal();
        listarUsuarios();
    }
}

// Permite fechar o modal com a tecla Esc
document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && !modal.hidden) {
        fecharModal();
    }
});


/* ===================================================================
   Validação dos campos obrigatórios (no navegador)
   =================================================================== */

function validarFormulario() {
    limparErros();
    let valido = true;

    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const dataNascimento = document.getElementById("dataNascimento").value;

    if (nome === "") {
        marcarErro("nome", "Informe o nome.");
        valido = false;
    }

    if (cpf === "") {
        marcarErro("cpf", "Informe o CPF.");
        valido = false;
    } else if (!/^\d{11}$/.test(cpf)) {
        marcarErro("cpf", "O CPF deve conter exatamente 11 dígitos numéricos.");
        valido = false;
    }

    if (email === "") {
        marcarErro("email", "Informe o e-mail.");
        valido = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        marcarErro("email", "Informe um e-mail válido.");
        valido = false;
    }

    if (telefone === "") {
        marcarErro("telefone", "Informe o telefone.");
        valido = false;
    }

    if (dataNascimento === "") {
        marcarErro("dataNascimento", "Informe a data de nascimento.");
        valido = false;
    } else if (new Date(dataNascimento) >= new Date()) {
        marcarErro("dataNascimento", "A data de nascimento deve ser anterior a hoje.");
        valido = false;
    }

    return valido;
}

function marcarErro(idCampo, mensagem) {
    const campo = document.getElementById(idCampo);
    const rotuloErro = document.getElementById("erro" + idCampo.charAt(0).toUpperCase() + idCampo.slice(1));
    campo.classList.add("invalido");
    if (rotuloErro) {
        rotuloErro.textContent = mensagem;
    }
}

function limparErros() {
    document.querySelectorAll(".erro").forEach(elemento => elemento.textContent = "");
    document.querySelectorAll("input").forEach(elemento => elemento.classList.remove("invalido"));
}


/* ===================================================================
   Funções auxiliares
   =================================================================== */

// Monta a mensagem de erro a partir da resposta da API
function montarMensagemErro(corpoErro) {
    if (corpoErro.campos) {
        return Object.values(corpoErro.campos).join(" ");
    }
    return corpoErro.mensagem || "Não foi possível concluir a operação.";
}

function exibirAviso(mensagem, tipo) {
    const aviso = document.createElement("div");
    aviso.className = `aviso aviso-${tipo}`;
    aviso.textContent = mensagem;
    areaAviso.appendChild(aviso);

    setTimeout(() => aviso.remove(), 4000);
}

// "2003-05-15" -> "15/05/2003"
function formatarData(data) {
    if (!data) return "-";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
}

// "2026-08-18T13:22:10" -> "18/08/2026 13:22"
function formatarDataHora(dataHora) {
    if (!dataHora) return "-";
    const [data, hora] = dataHora.split("T");
    const [ano, mes, dia] = data.split("-");
    const horaMinuto = hora ? hora.substring(0, 5) : "";
    return `${dia}/${mes}/${ano} ${horaMinuto}`.trim();
}

// Evita que conteúdo digitado pelo usuário seja interpretado como HTML
function escaparTexto(texto) {
    if (texto === null || texto === undefined) return "";
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
