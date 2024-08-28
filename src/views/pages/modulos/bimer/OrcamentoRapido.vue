<script setup>
import { ref, watchEffect, onBeforeMount } from 'vue';
import { FilterMatchMode, FilterOperator } from 'primevue/api';
import { instanceLocalServer, blankInstance } from '../../../../service/axios.js';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import { PrimeIcons } from 'primevue/api';
pdfMake.fonts = {
    Roboto: {
        normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
        bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
    }
};

const nome = ref('');
const orcamentoSelecionado = ref('');
const urlEnvio = ref(import.meta.env.VITE_WEBHOOK_MAKE_ORC_RAPIDO);
const telefone = ref('');
const produtos = ref([{ produto: '', quantidade: 1, codigo: '', valorUnitario: 0.0, valorTotal: 0.0 }]);
const produtosEncontrados = ref([{ produto: '', codigo: '', valorUnitario: 0 }]);
const sugestoesProdutos = ref([]);
const empresas = ref([]);
const idempresa = ref('');
const empresasEncontradas = ref([]);
const pessoas = ref([]);
const idpessoa = ref('');
const pessoasEncontradas = ref([]);
const idSetorBimer = ref('');
const setoresBimer = ref('');
const operacoesBimer = ref('');
const idOperacaoBimer = ref('');
const orcConvertPedido = ref([]);
const operacoesEncontradas = ref([]);
const setoresEncontrados = ref([]);
const idPrecoBimer = ref('');
const precosBimer = ref('');
const precosEncontrados = ref([]);
const dadosEmpresa = ref([]);
const pedido = ref([]);
const submitButtonOrcStatus = ref(true);
const opcaoSelecionada = ref('nome');
const opcaoEnvioSelecionada = ref({ code: 'com-preco', name: 'Sim' });
const toast = useToast();
const confirm = useConfirm();
const nomeVendedores = ref([
    { code: 'helena', name: 'Helena' },
    { code: 'delcy', name: 'Delcy' },
    { code: 'rosa', name: 'Rosa' },
    { code: 'nilson', name: 'Nilson' },
    { code: 'lucia', name: 'Lúcia' },
    { code: 'daiana', name: 'Daiana' },
    { code: 'daniele', name: 'Daniele' },
    { code: 'outros', name: 'Outros' }
]);
const dialogVisible = ref(false);
const dialogConversaoVisible = ref(false);
const vendedor = ref('null');
const totalOrcamento = ref(0.00);
const opcoesConsulta = ref(['nome', 'codigo']);
const opcoesEnvio = ref([
    { code: 'com-preco', name: 'Sim' },
    { code: 'sem-preco', name: 'Não' }
]);
const orcamentos = ref([]);
const filters = ref(null);

const showMessage = (severity, summary, detail) => {
    toast.add({ severity: severity, summary: summary, detail: detail });
};
const adicionarProduto = () => {
    produtos.value.push({ produto: '', quantidade: 1 });
};

const removerProduto = (index) => {
    if (produtos.value.length > 1) {
        produtos.value.splice(index, 1);
    }
};
onBeforeMount(() => {
    initFilters();
    fetchEmpresas();
    fetchPrecosBimer();
    fetchSetoresBimer();
});
const initFilters = () => {
    filters.value = {
        createdAt: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] }
    };
};
if (localStorage.getItem('OR_EMP')) {
    idempresa.value = JSON.parse(localStorage.getItem('OR_EMP')).codigo + ' - ' + JSON.parse(localStorage.getItem('OR_EMP')).nome;
    dadosEmpresa.value.empresa = JSON.parse(localStorage.getItem('OR_EMP'));
}
if (localStorage.getItem('OR_PRE')) {
    idPrecoBimer.value = JSON.parse(localStorage.getItem('OR_PRE')).codigo + ' - ' + JSON.parse(localStorage.getItem('OR_PRE')).nome;
    dadosEmpresa.value.precos = JSON.parse(localStorage.getItem('OR_PRE'));
}
if (localStorage.getItem('OR_SETOR')) {
    idSetorBimer.value = JSON.parse(localStorage.getItem('OR_SETOR')).codigo + ' - ' + JSON.parse(localStorage.getItem('OR_SETOR')).nome;
    dadosEmpresa.value.setor = JSON.parse(localStorage.getItem('OR_SETOR'));
}

const optionsMenuActions = (val) => {
    return [
        {
            label: 'Enviar Whatsapp',
            icon: PrimeIcons.WHATSAPP,
            command: () => {
                requireConfirmation(val);
            }
        },
        {
            label: 'Gerar no Bimer',
            icon: PrimeIcons.CART_PLUS,
            command: () => {
                gerarPedidoDeVenda(val);
            }
        }
    ];
};

// INICIO DE ROTINA AUTOCOMPLETE SETORES

const fetchOperacaoBimer = async () => {
    operacoesBimer.value = ['localizando aguarde...'];
    try {
        const operacaoBimer = await instanceLocalServer.get(`bimer/api/operacoes`);
        operacoesEncontradas.value = operacaoBimer.data.resposta.ListaObjetos.filter((operacaoBimer) => operacaoBimer.Tipo == 'Venda').map((operacaoBimer) => ({
            codigo: `${operacaoBimer.Codigo}`,
            identificador: `${operacaoBimer.Identificador}`,
            nome: `${operacaoBimer.Nome}`
        }));

        operacoesBimer.value = operacoesEncontradas.value.map(
            (operacaoBimer) =>
            ({
                value: `${operacaoBimer.codigo} - ${operacaoBimer.nome.trim()}`
            }.value)
        );
    } catch (error) {
        console.error('Erro ao buscar Operações:', error);
        return [];
    }
};
const processaInfosOperacao = async (val) => {
    try {
        const resultado = operacoesEncontradas.value.find((e) => {
            return e.codigo.trim() === val.value.split('-')[0].trim(); // Adiciona o return para a comparação
        });

        if (resultado) {
            const operacao = await instanceLocalServer.get(`bimer/api/operacoes/${resultado.identificador}`);
            orcConvertPedido.value.configuracao.operacao = {
                idOperacao: operacao.data.resposta.ListaObjetos[0].Identificador,
                nome: operacao.data.resposta.ListaObjetos[0].Nome,
                codigo: operacao.data.resposta.ListaObjetos[0].Codigo
            }
        }
    } catch (error) {
        console.error('Erro ao buscar Operacoes:', error);
        return [];
    }
};
// FIM DE ROTINA AUTOCOMPLETE SETORES


const fetchPessoas = async (val) => {
    pessoas.value = ['localizando aguarde...'];

    try {
        const pessoa = await instanceLocalServer.get(`bimer/api/pessoas?cpfCnpj=${val.query}`);
        pessoasEncontradas.value = pessoa.data.resposta.ListaObjetos.map((pessoa) => ({
            codigo: `${pessoa.Codigo}`,
            nome: `${pessoa.Nome.trim()}`,
            cpf: `${pessoa.CpfCnpjCompleto}`
        }));
        pessoas.value = pessoasEncontradas.value.map(
            (pessoa) =>
            ({
                value: `${pessoa.cpf} - ${pessoa.nome.trim()}`
            }.value)
        );
    } catch (error) {
        console.error('Erro ao buscar Pessoa:', error);
        return [];
    }
};

const processaInfosPessoas = async (val) => {
    try {
        const resultado = pessoasEncontradas.value.find((e) => {
            return e.cpf.trim() === val.value.split('-')[0].trim(); // Adiciona o return para a comparação
        });
        if (resultado) {
            const pessoa = await instanceLocalServer.get(`bimer/api/pessoas?cpfCnpj=${resultado.cpf}`);
            orcConvertPedido.value.cliente = JSON.parse(JSON.stringify(pessoa.data.resposta.ListaObjetos[0]));
        }
    } catch (error) {
        console.error('Erro ao buscar Pessoas', error);
        return [];
    }
};

// FIM DE ROTINA AUTOCOMPLETE EMPRESA


// INICIO DE ROTINA AUTOCOMPLETE EMPRESA

const fetchEmpresas = async (val) => {
    empresas.value = ['localizando aguarde...'];

    try {
        const empresa = await instanceLocalServer.get(`bimer/api/empresas?nome=${val.query}`);
        empresasEncontradas.value = empresa.data.resposta.ListaObjetos.map((empresa) => ({
            codigo: `${empresa.Codigo}`,
            nome: `${empresa.Nome.trim()}`,
            cpnj: `${empresa.CpfCnpj}`
        }));
        empresas.value = empresasEncontradas.value.map(
            (empresa) =>
            ({
                value: `${empresa.codigo} - ${empresa.nome.trim()}`
            }.value)
        );
    } catch (error) {
        console.error('Erro ao buscar Empresas:', error);
        return [];
    }
};

const processaInfosEmpresa = (val) => {
    try {
        const resultado = empresasEncontradas.value.find((e) => {
            return e.codigo.trim() === val.value.split('-')[0].trim(); // Adiciona o return para a comparação
        });
        if (resultado) {
            dadosEmpresa.value.empresa = JSON.parse(JSON.stringify(resultado));
            localStorage.setItem('OR_EMP', JSON.stringify(dadosEmpresa.value.empresa));
        }
    } catch (error) {
        console.error('Erro ao buscar Empresas', error);
        return [];
    }
};

// FIM DE ROTINA AUTOCOMPLETE EMPRESA

// INICIO DE ROTINA AUTOCOMPLETE TABELA DE PREÇOS

const fetchPrecosBimer = async () => {
    precosBimer.value = ['localizando aguarde...'];

    try {
        const precoBimer = await instanceLocalServer.get(`bimer/api/tabelaprecos/porNome?porTrecho=true&nome=%`);
        precosEncontrados.value = precoBimer.data.resposta.ListaObjetos.map((precoBimer) => ({
            codigo: `${precoBimer.Codigo}`,
            nome: `${precoBimer.Nome.trim()}`,
            identificador: `${precoBimer.Identificador}`
        }));
        precosBimer.value = precosEncontrados.value.map(
            (precoBimer) =>
            ({
                value: `${precoBimer.codigo} - ${precoBimer.nome.trim()}`
            }.value)
        );
    } catch (error) {
        console.error('Erro ao buscar Preços:', error);
        return [];
    }
};

const processaInfosPrecos = (val) => {
    try {
        const resultado = precosEncontrados.value.find((e) => {
            return e.codigo.trim() === val.value.split('-')[0].trim(); // Adiciona o return para a comparação
        });
        if (resultado) {
            dadosEmpresa.value.precos = JSON.parse(JSON.stringify(resultado));
            localStorage.setItem('OR_PRE', JSON.stringify(dadosEmpresa.value.precos));
        }
    } catch (error) {
        console.error('Erro ao buscar Preços:', error);
        return [];
    }
};
// FIM DE ROTINA AUTOCOMPLETE TABELA DE PREÇOS

// INICIO DE ROTINA AUTOCOMPLETE SETORES

const fetchSetoresBimer = async () => {
    setoresBimer.value = ['localizando aguarde...'];
    const empresaSelecionada = localStorage.getItem('OR_EMP');
    if (!empresaSelecionada) {
        showMessage('warn', 'Atenção', 'Selecione primeiro uma empresa');
    } else {
        try {
            const setorBimer = await instanceLocalServer.get(`bimer/api/setores`);
            setoresEncontrados.value = setorBimer.data.resposta.ListaObjetos.filter((setorBimer) => setorBimer.Empresa.Codigo == JSON.parse(empresaSelecionada).codigo).map((setorBimer) => ({
                empresa: `${setorBimer.Empresa.Codigo}`,
                codigo: `${setorBimer.Codigo}`,
                nome: `${setorBimer.Descricao.trim()}`,
                identificador: `${setorBimer.Identificador}`
            }));
            setoresBimer.value = setoresEncontrados.value.map(
                (setorBimer) =>
                ({
                    value: `${setorBimer.codigo} - ${setorBimer.nome.trim()}`
                }.value)
            );
        } catch (error) {
            console.error('Erro ao buscar Setores:', error);
            return [];
        }
    }
};
const processaInfosSetores = (val) => {
    try {
        const resultado = setoresEncontrados.value.find((e) => {
            return e.codigo.trim() === val.value.split('-')[0].trim(); // Adiciona o return para a comparação
        });
        if (resultado) {
            dadosEmpresa.value.setor = JSON.parse(JSON.stringify(resultado));
            localStorage.setItem('OR_SETOR', JSON.stringify(dadosEmpresa.value.setor));
        }
    } catch (error) {
        console.error('Erro ao buscar setores:', error);
        return [];
    }
};
// FIM DE ROTINA AUTOCOMPLETE SETORES

// INICIO DE ROTINA AUTOCOMPLETE DOS PRODUTOS
//pesquisa itens e apresenta
const fetchProdutos = async (val) => {
    sugestoesProdutos.value = ['localizando aguarde...'];
    let rota = opcaoSelecionada.value === 'nome' ? 'consulta-produto' : 'consulta-produto-codigo';
    try {
        const produto = await instanceLocalServer.get(`bimer/${rota}?query=${val.query}&idempresa=${dadosEmpresa.value.empresa.codigo}&idpreco=${dadosEmpresa.value.precos.identificador}&idsetor=${dadosEmpresa.value.setor.identificador}`);
        sugestoesProdutos.value = produto.data.produtos.map(
            (produto) =>
            ({
                value: `${produto.codigo.trim()} | ${produto.nome} | R$ ${produto.preco}`
            }.value)
        );

        produtosEncontrados.value = produto.data.produtos.map((produto) => ({
            codigo: produto.codigo.trim(),
            identificador: produto.identificador,
            produto: produto.nome,
            valorUnitario: produto.preco,
            value: `${produto.codigo.trim()} | ${produto.nome} | R$ ${produto.preco}`
        }));

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }
};

//preenche inputs quando selecionado
const preencherInfos = (val, index) => {
    try {
        const resultado = produtosEncontrados.value.find((e) => {
            return e.codigo.trim() === val.value.split('|')[0].trim(); // Adiciona o return para a comparação
        });

        if (resultado) {
            const novoresultado = JSON.parse(JSON.stringify(resultado));
            produtos.value[index].codigo = novoresultado.codigo.trim();
            produtos.value[index].valorUnitario = formatarReal(novoresultado.valorUnitario);
            produtos.value[index].produto = novoresultado.produto;
            calcularTotalItem(index);
            calcularTotalCompra();
        }
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }
};
//FIM DA ROTINA AUTOCOMPLETE DOS PRODUTOS

const formatarReal = (valor) => {
    if (typeof valor !== 'number' || isNaN(valor)) {
        return '0';
    }
    const valorFormatado = Math.ceil(valor * 100) / 100; // Arredonda para cima com duas casas decimais
    return valorFormatado.toFixed(2);
};

const calcularTotalItem = (index) => {
    const quantidade = parseFloat(produtos.value[index].quantidade);
    const valorUnitario = parseFloat(produtos.value[index].valorUnitario);

    if (!isNaN(quantidade) && !isNaN(valorUnitario)) {
        produtos.value[index].valorTotal = formatarReal(quantidade * valorUnitario);
    } else {
        produtos.value[index].valorTotal = formatarReal(0);
    }
};

const formatarData = (dataString) => {
    if (dataString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', options);
    }
};

const calcularTotalCompra = () => {
    totalOrcamento.value = produtos.value.reduce((total, produto) => {
        const quantidade = parseFloat(produto.quantidade);
        const valorUnitario = parseFloat(produto.valorUnitario);

        if (!isNaN(quantidade) && !isNaN(valorUnitario)) {
            return total + quantidade * valorUnitario;
        } else {
            return total;
        }
    }, 0);
};

const getOrcamentoById = async (orcamento) => {
    try {
        const response = await instanceLocalServer.get(`bimer/orcamento/${orcamento.id}`);
        const orcamentoDetalhado = response.data;
        // Adiciona a chave "valor total" a cada produto no orçamento
        orcamentoDetalhado.ProdutosOrcamentos.forEach((produto) => {
            produto.valorTotal = produto.valorunitario * produto.quantidade;
        });
        return orcamentoDetalhado;
    } catch (err) {
        showMessage('error', 'Erro ao Obter Orçamento', err);
    }
};

const abrirOverlayPanel = async (orcamento) => {
    orcamentoSelecionado.value = await getOrcamentoById(orcamento);
    dialogVisible.value = true;
};

const gerarLayoutImpressao = () => {
    // Crie o layout HTML para o orçamento detalhado
    const layoutImpressao = `
        <div style="margin:0; padding:0; font-size:10px">
          <h5>Detalhes do Orçamento</h5>
          <p><strong>Nome:</strong> ${orcamentoSelecionado.value.nome}<br/> 
          <strong>Telefone:</strong> ${orcamentoSelecionado.value.telefone}<br/> 
          <Strong>Vendedor:</Strong> ${orcamentoSelecionado.value.vendedor}</p>

          <table border="1">
            <thead>
              <tr>
                <th>CD. PRODUTO</th>
                <th>NOME</th>
                <th>QT</th>
                <th>VL.UNIT</th>
                <th>VL.TOT</th>
              </tr>
            </thead>
            <tbody>
              ${orcamentoSelecionado.value.ProdutosOrcamentos.map(
        (produto) => `
                  <tr>
                    <td>${produto.codigo}</td>
                    <td>${produto.nome}</td>
                    <td>${produto.quantidade}</td>
                    <td>${formatCurrency(produto.valorunitario)}</td>
                    <td>${formatCurrency(produto.valorTotal)}</td>
                  </tr>
                `
    ).join('')}
            </tbody>
          </table>
        </div>
      `;

    return layoutImpressao;
};

const imprimirOrcamento = () => {
    const conteudoHtml = gerarLayoutImpressao();
    // Converte o HTML para um formato suportado pelo pdfmake
    const pdfPreMake = htmlToPdfmake(conteudoHtml);
    // Cria o documento PDF
    const pdfDoc = {
        pageSize: {
            width: 226.8,
            height: 'auto'
        },
        content: pdfPreMake,
        pageMargins: [0, 0, 0, 0]
    };
    pdfMake.createPdf(pdfDoc).print();
    // Abre a caixa de diálogo de impressão padrão do navegador
};

const submitForm = async () => {
    submitButtonOrcStatus.value = false;
    let produtosFormatados = '';
    try {
        if (opcaoEnvioSelecionada.value.code == 'sem-preco') {
            produtosFormatados = produtos.value.map((produto) => `${produto.codigo} - ${produto.produto} \\n Quantidade: ${produto.quantidade}`).join('\\n\\n');
        } else {
            produtosFormatados = produtos.value
                .map((produto) => `${produto.codigo} - ${produto.produto} \\n ${formatCurrency(parseFloat(produto.valorUnitario))} x ${produto.quantidade} = ${formatCurrency(parseFloat(produto.valorTotal))}`)
                .join('\\n \\n');
        }
        const data = {
            name: nome.value,
            phone: telefone.value,
            vendedor: vendedor.value.code,
            produtos: produtosFormatados,
            totalPedido: formatCurrency(totalOrcamento.value),
            emissao: Date.now()
        };

        // Envia a requisição POST para a URL letalk.com/message
        const response = await blankInstance.post(urlEnvio.value, data);

        const orcamentoRapidoData = {
            createdAt: new Date(),
            nome: nome.value,
            telefone: telefone.value,
            produtos: produtos.value.map((produto) => ({
                codigo: produto.codigo,
                nome: produto.produto,
                quantidade: produto.quantidade,
                valorunitario: produto.valorUnitario
            })),
            vendedor: vendedor.value.code,
            dadosEmpresa: {
                setor: dadosEmpresa.value.setor,
                empresa: dadosEmpresa.value.empresa,
                precos: dadosEmpresa.value.precos
            },
            geroupedido: false
        };
        const response2 = await instanceLocalServer.post('bimer/orcamento', orcamentoRapidoData);

        nome.value = '';
        telefone.value = '';
        vendedor.value = '';
        produtos.value = [{ produto: '', quantidade: 1, codigo: '', valorUnitario: 0, valorTotal: 0 }];
        totalOrcamento.value = 0.00;
        showMessage('success', 'Orçamento Enviado', 'Orçamento Enviado com Sucesso, em breve seu cliente receberá uma mensagem');
        fetchOrcamentos();
        submitButtonOrcStatus.value = true;
        // Adicione qualquer lógica adicional após o envio bem-sucedido
    } catch (error) {
        submitButtonOrcStatus.value = true;
        console.error('Erro ao enviar formulário:', error);
        // Adicione lógica para lidar com erros, se necessário
    }
};

const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits:2 });
};

const fetchOrcamentos = async () => {
    try {
        const response = await instanceLocalServer.get('bimer/orcamento');
        orcamentos.value = response.data;
    } catch (error) {
        console.error('Erro ao buscar orçamentos:', error);
    }
};

const requireConfirmation = (orcamento) => {
    confirm.require({
        group: 'headless',
        header: 'Escolha uma opção',
        message: 'Como deseja enviar o orçamento',
        accept: () => {
            reenviarOrcamento(orcamento, 'com-preco');
        },
        reject: () => {
            reenviarOrcamento(orcamento, 'sem-preco');
        }
    });
};

const reenviarOrcamento = async (orcamento, type) => {
    orcamentoSelecionado.value = await getOrcamentoById(orcamento);
    let produtosFormatados = '';
    if (type == 'sem-preco') {
        produtosFormatados = orcamentoSelecionado.value.ProdutosOrcamentos.map((produto) => `${produto.codigo} - ${produto.nome} \\n Quantidade: ${produto.quantidade}`).join('\\n \\n');
    } else {
        produtosFormatados = orcamentoSelecionado.value.ProdutosOrcamentos.map(
            (produto) => `${produto.codigo} - ${produto.nome} \\n ${formatCurrency(produto.valorunitario)} x ${produto.quantidade} = ${formatCurrency(produto.valorunitario * produto.quantidade)}`
        ).join('\\n \\n');
    }
    try {
        const data = {
            name: orcamentoSelecionado.value.nome,
            phone: orcamentoSelecionado.value.telefone,
            vendedor: orcamentoSelecionado.value.vendedor,
            produtos: produtosFormatados,
            totalPedido: formatCurrency(orcamentoSelecionado.value.ProdutosOrcamentos.reduce((total, produto) => total + produto.valorunitario * produto.quantidade, 0))
        };
        // Envia a requisição POST para a URL letalk.com/message
        const response = await blankInstance.post(urlEnvio.value, data);
        showMessage('success', 'Orçamento Reenviado', 'Orçamento Enviado com Sucesso, em breve seu cliente receberá uma mensagem');
        // Lógica para reenviar o orçamento
    } catch (error) {
        console.error('Erro ao reenviar orçamento:', error);
    }
};

const gerarPedidoDeVenda = async (orcamento) => {
    const cliente = await instanceLocalServer.get(`bimer/consulta-cliente-telefone?query=${orcamento.telefone}`);
    const config = await instanceLocalServer.get('bimer/api/configuracoes?nomeSecao=Faturamento.Documento');
    const caracEntregaFutura = await instanceLocalServer.get('bimer/api/configuracoes?nomeSecao=Estoque.Produto');
    const produtosOrcamento = [];
    let operacao = {}
    let entregaFutura = {}
    if (config) {
        const idOperacao = config.data.resposta.ListaObjetos.filter((config) => config.NomeConfiguracao == 'IdOperacaoNF')[0].Valor
        operacao = await instanceLocalServer.get(`bimer/api/operacoes/${idOperacao}`)
    }
    const stTrabalhaEntregaImediataFutura = caracEntregaFutura.data.resposta.ListaObjetos.filter((config) => config.NomeConfiguracao == 'StTrabalhaEntregaImediataFutura')[0].Valor
    if (stTrabalhaEntregaImediataFutura == 1) {
        console.log(stTrabalhaEntregaImediataFutura)
        if (caracEntregaFutura) {
            const idCaracteristicaEntregaFutura = caracEntregaFutura.data.resposta.ListaObjetos.filter((config) => config.NomeConfiguracao == 'IdCaracteristicaEntregaFutura')[0].Valor
            entregaFutura = {
                IdCaracteristicaEntregaFutura: idCaracteristicaEntregaFutura,
                StTrabalhaEntregaImediataFutura: stTrabalhaEntregaImediataFutura
            }
        }
    }
    const orcamentoConecta = await getOrcamentoById(orcamento);
    for (let i = 0; i < orcamentoConecta.ProdutosOrcamentos.length; i++) {
        const codigo = await instanceLocalServer.get(`bimer/api/produtos?codigo=${orcamentoConecta.ProdutosOrcamentos[i].codigo}`);
        const caracteristicasProduto = codigo.data.resposta.ListaObjetos[0].CaracteristicasProduto.map((caracteristicas) => caracteristicas.Identificador);
        let entregaFuturaValue
        if (stTrabalhaEntregaImediataFutura == 1) {
            entregaFuturaValue = caracteristicasProduto.includes(entregaFutura.IdCaracteristicaEntregaFutura) ? 1 : 0;
        } else {
            entregaFuturaValue = 0;
        }
        produtosOrcamento.push({
            IdentificadorProduto: codigo.data.resposta.ListaObjetos[0].Identificador,
            Codigo: codigo.data.resposta.ListaObjetos[0].Codigo,
            Nome: codigo.data.resposta.ListaObjetos[0].Nome,
            EntregaFutura: entregaFuturaValue,
            QuantidadePedida: orcamentoConecta.ProdutosOrcamentos[i].quantidade,
            ValorUnitario: orcamentoConecta.ProdutosOrcamentos[i].valorunitario,
            Valor: orcamentoConecta.ProdutosOrcamentos[i].valorTotal
        })
    }
    orcConvertPedido.value = {
        cliente: cliente.data.detalhesPessoa.ListaObjetos[0],
        empresa: orcamento.dadosEmpresa,
        preco: orcamento.dadosEmpresa.precos,
        setor: orcamento.dadosEmpresa.setor,
        configuracao: {
            operacao: {
                idOperacao: operacao.data.resposta.ListaObjetos[0].Identificador,
                nome: operacao.data.resposta.ListaObjetos[0].Nome,
                codigo: operacao.data.resposta.ListaObjetos[0].Codigo
            },
            entregaFutura
        },
        produtos: produtosOrcamento,
    }
    idpessoa.value = `${orcConvertPedido.value.cliente.CpfCnpjCompleto} - ${orcConvertPedido.value.cliente.Nome}`
    idOperacaoBimer.value = `${orcConvertPedido.value.configuracao.operacao.codigo} - ${orcConvertPedido.value.configuracao.operacao.nome}`
    processaInfosPessoas({ value: idpessoa.value })
    processaInfosOperacao({ value: idOperacaoBimer.value })
    dialogConversaoVisible.value = true;

    console.log(orcConvertPedido.value)

    // setPedidoVenda(orcConvertPedido.value)
};

const setPedidoVenda = async (orcConvertido) => {

    try {
        const pedido = {
            CodigoEmpresa: orcConvertido.empresa.empresa.codigo,
            CodigoEmpresaEstoque: orcConvertido.empresa.empresa.codigo,
            CodigoEmpresaFinanceiro: orcConvertido.empresa.empresa.codigo,
            DataEmissao: new Date().toISOString(),
            DataEntrega: new Date().toISOString(),
            FaturamentoParcial: true,
            IdentificadorCliente: orcConvertido.cliente.Identificador,
            IdentificadorOperacao: orcConvertido.configuracao.operacao.idOperacao,
            Items: orcConvertido.produtos,
            Observacao: "Cadastrado via Beng - Conecta Varejo",
            ObservacaoDocumento: "Cadastrado via Beng - Conecta Varejo",
            Status: "A",
            IndicadorAtendimentoPresencial: 1,
        }

        const pedidoEnviado = await instanceLocalServer.post('bimer/api/venda/pedidos', pedido);

        console.log(pedidoEnviado)


    } catch (error) {
        console.log(error)
    }

}

watchEffect(() => {
    calcularTotalCompra();
});
fetchOrcamentos();
</script>

<template>
    <Toast />
    <div class="card">
        <h5>Envio de Orçamento Rápido</h5>
        <div class="p-fluid mt-3">
            <form @submit.prevent="submitForm" class="flex flex-wrap">
                <Fieldset legend="Dados do Orçamento" class="col-12 md:col-12">
                    <div class="flex flex-wrap">
                        <div class="field col-12 md:col-6">
                            <label for="idempresa">Empresa</label>
                            <AutoComplete id="idempresa" v-model="idempresa" dropdown :suggestions="empresas"
                                @complete="fetchEmpresas" @item-select="processaInfosEmpresa($event)" />
                        </div>
                        <div class="field col-12 md:col-3">
                            <label for="idPrecoBimer">Tabela de Preço</label>
                            <AutoComplete id="idPrecoBimer" v-model="idPrecoBimer" dropdown :suggestions="precosBimer"
                                @complete="fetchPrecosBimer" @item-select="processaInfosPrecos($event)" />
                        </div>
                        <div class="field col-12 md:col-3">
                            <label for="idSetorBimer">Setor</label>
                            <AutoComplete id="idSetorBimer" v-model="idSetorBimer" dropdown :suggestions="setoresBimer"
                                @complete="fetchSetoresBimer" @item-select="processaInfosSetores($event)" />
                        </div>
                    </div>
                    <div class="flex flex-wrap">
                        <div class="field col-12 md:col-4">
                            <InputGroup>
                                <InputGroupAddon><i class="pi pi-user"></i></InputGroupAddon>
                                <span class="p-float-label">
                                    <InputText v-model="nome" id="nome" required />
                                    <label for="nome">Nome</label>
                                </span>
                            </InputGroup>
                        </div>
                        <div class="field col-12 md:col-4">
                            <InputGroup>
                                <InputGroupAddon><i class="pi pi-whatsapp"></i></InputGroupAddon>
                                <span class="p-float-label">
                                    <InputMask v-model="telefone" id="telefone" mask="99999999999" required />
                                    <label for="telefone">Telefone</label>
                                </span>
                            </InputGroup>
                        </div>

                        <div class="field col-12 md:col-4">
                            <InputGroup>
                                <InputGroupAddon><i class="pi pi-heart-fill"></i></InputGroupAddon>
                                    <Dropdown v-model="vendedor" id="vendedor" optionLabel="name"
                                        :options="nomeVendedores" placeholder="Selecione um vendedor" required>
                                    </Dropdown>
                            </InputGroup>
                        </div>
                    </div>
                </Fieldset>
                <div class="col-12 md:col-12 flex flex-wrap">
                    <div class="field col-12 md:col-3">
                        <label>Pesquisar por ?</label>
                        <SelectButton v-model="opcaoSelecionada" :options="opcoesConsulta" />
                    </div>
                    <div class="field col-12 md:col-3">
                        <label>Enviar Valor Unitário?</label>
                        <SelectButton v-model="opcaoEnvioSelecionada" :options="opcoesEnvio" optionLabel="name" />
                    </div>
                </div>
                <div class="col-12 md:col-12 font-bold" style="padding-top: 1px; padding-bottom: 1px">
                    <InputGroup style="border: 0px !important;">
                        <InputGroupAddon style="width:3; border: 0px !important;"></InputGroupAddon>
                        <InputGroupAddon style="width:10%;border: 0px !important;"><label>Cod.</label></InputGroupAddon>
                        <InputGroupAddon style="width:13%;border: 0px !important;"><label>Vl.Uni</label></InputGroupAddon>
                        <InputGroupAddon style="width:42%;border: 0px !important;"><label>Descrição</label></InputGroupAddon>
                        <InputGroupAddon style="width:5%;border: 0px !important;"><label>Qt.</label></InputGroupAddon>
                        <InputGroupAddon style="width:15%;border: 0px !important;"><label>Vl.Total</label></InputGroupAddon>
                        <InputGroupAddon style="width:12%;border: 0px !important;"><label></label></InputGroupAddon>
                    </InputGroup>
                </div>
                <div v-for="(produto, index) in produtos" :key="index" class="mb-1 col-12 md:col-12"
                    style="padding-top: 1px; padding-bottom: 1px">
                    <InputGroup>
                        <InputGroupAddon style="width:3;"><i class="pi pi-box"></i></InputGroupAddon>
                        <InputGroupAddon style="width:10%;"><label>{{ produtos[index].codigo }}</label></InputGroupAddon>
                        <InputGroupAddon style="width:13%;"><label>R$ {{ produtos[index].valorUnitario }}</label>
                        </InputGroupAddon>
                        <AutoComplete style="width: 42%" v-model="produtos[index].produto" @loading="true"
                            @complete="fetchProdutos" :suggestions="sugestoesProdutos"
                            placeholder="Digite para buscar produtos" :id="'produto-' + index"
                            @item-select="preencherInfos($event, index)" />
                        <InputNumber style="width: 5%" v-model="produtos[index].quantidade" mode="decimal"
                            @update:modelValue="calcularTotalItem(index)" />
                        <InputGroupAddon style="width:15%;"><label>R$ {{ produtos[index].valorTotal }}</label>
                        </InputGroupAddon>
                        <Button style="width:6%;" type="button" @click="adicionarProduto" icon="pi pi-plus-circle"
                            class="p-button-success"></Button>
                        <Button style="width:6%;" v-if="produtos.length > 1" type="button" @click="removerProduto(index)"
                            icon="pi pi-trash" class="p-button-danger"></Button>
                        <Button style="width:6%;" v-if="produtos.length === 1" type="button" @click="removerProduto(index)"
                            icon="pi pi-trash" class="p-button-danger" disabled></Button>
                    </InputGroup>
                </div>
                <div class="field col-12 md:col-12">
                    <label>Total Orcamento: R$ {{ totalOrcamento }}</label>
                    <Button type="submit" class="justify-content-center" :disabled="!submitButtonOrcStatus">Enviar
                        Orçamento</Button>
                </div>
            </form>
        </div>
        <div class="mt-4">
            <DataTable :value="orcamentos" :paginator="true" :rows="10" :filters="filters" v-model:filters="filters"
                sortField="id" :sortOrder="-1" filterDisplay="menu">
                <Column field="id" header="Codigo"></Column>
                <Column field="nome" header="Cliente"></Column>
                <Column field="telefone" header="Telefone"></Column>
                <Column field="vendedor" header="Vendedor"></Column>
                <Column filterField="createdAt" dataType="date" header="Data de Criação">
                    <template #body="{ data }">
                        {{ formatarData(data.createdAt) }}
                    </template>
                    <template #filter="{ filterModel }">
                        <DatePicker v-model="filterModel.value" placeholder="dd/mm/yyyy" />
                    </template>
                </Column>
                <Column header="Ações">
                    <template #body="slotProps">
                        <SplitButton icon="pi pi-eye" dropdownIcon="pi pi-cog"
                            @click="abrirOverlayPanel(slotProps.data)" :model="optionsMenuActions(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>

    <!-- chama dialog Detalhes de Orçamento -->

    <Dialog v-model:visible="dialogVisible" header="Detalhes do Orçamento" modal>
        <div>
            <p>
                <strong>Empresa:</strong> {{ orcamentoSelecionado.dadosEmpresa.empresa.nome }} <br /><strong>Tabela de
                    Preço:</strong> {{ orcamentoSelecionado.dadosEmpresa.precos.nome }} <br /><Strong>Setor:</Strong>
                {{ orcamentoSelecionado.dadosEmpresa.setor.nome }}
            </p>
            <p><strong>Nome:</strong> {{ orcamentoSelecionado.nome }} <strong> - Telefone:</strong> {{
                orcamentoSelecionado.telefone }} <Strong> - Vendedor:</Strong> {{ orcamentoSelecionado.vendedor }}</p>

            <DataTable :value="orcamentoSelecionado.ProdutosOrcamentos" :paginator="true" :rows="10">
                <Column field="codigo" header="Codigo"></Column>
                <Column field="nome" header="Nome"></Column>
                <Column field="quantidade" header="Qt."></Column>
                <Column field="valorunitario" header="Vl. Unitario">
                    <template #body="{ data }">
                        <span class="font-bold">{{ formatCurrency(data.valorunitario) }}</span>
                    </template>
                </Column>
                <Column field="valorTotal" header="Vl. Total">
                    <template #body="{ data }">
                        <span class="font-bold">{{ formatCurrency(data.valorTotal) }}</span>
                    </template>
                </Column>
            </DataTable>
        </div>
    </Dialog>

    <!-- chama dialog Converter em pedido de venda -->
    <Dialog v-model:visible="dialogConversaoVisible" header="Gerar Pedido" modal class="w-100 m-5">
        <div class="p-fluid mt-0" style="margin-top: -30px !important">
            <form @submit.prevent="submitForm">
                <div class="flex flex-wrap col-12 md:col-12 mt-0">
                    <Fieldset legend="Dados do Cliente" class="field col-12 md:col-6">
                        <div>
                            <label for="idpessoa">Cliente</label>
                            <AutoComplete id="idpessoa" v-model="idpessoa" :suggestions="pessoas"
                                @complete="fetchPessoas" @item-select="processaInfosPessoas($event)" />
                        </div>
                        <div class="mt-2">
                            ({{ orcConvertPedido.cliente.Codigo }}) - {{ orcConvertPedido.cliente.Nome }} <br />
                            CPF/CNPJ: {{ orcConvertPedido.cliente.CpfCnpjCompleto }} I.E.: {{
                                orcConvertPedido.cliente.InscricaoEstadual }} <br />
                            {{ orcConvertPedido.cliente.EnderecoPrincipal.TipoNomeNumeroComplementoLogradouro }} Bairro:
                            {{
                                orcConvertPedido.cliente.EnderecoPrincipal.Bairro.Nome }}
                            Cidade: {{ orcConvertPedido.cliente.EnderecoPrincipal.Cidade.Nome }}
                        </div>
                    </Fieldset>
                    <div class="field col-12 md:col-6">
                        <label for="idOperacaoBimer">Operação</label>
                        <AutoComplete id="idOperacaoBimer" v-model="idOperacaoBimer" dropdown
                            :suggestions="operacoesBimer" @complete="fetchOperacaoBimer"
                            @item-select="processaInfosOperacao($event)" />
                    </div>
                </div>
                <div class="card">
                    <DataTable :value="orcConvertPedido.produtos" tableStyle="min-width: 50rem">
                        <Column field="Codigo" header="Codigo"></Column>
                        <Column field="Nome" header="Nome"></Column>
                        <Column field="EntregaFutura" header="Ent. Futura"></Column>
                        <Column field="QuantidadePedida" header="Qt."></Column>
                        <Column field="ValorUnitario" header="Vl. Unitário"></Column>
                        <Column field="Valor" header="Vl. Total"></Column>
                    </DataTable>
                </div>
            </form>
        </div>
    </Dialog>

    <!-- chama dialog Enviar Mensagem Whatsapp -->
    <ConfirmDialog group="headless">
        <template #container="{ message, acceptCallback, rejectCallback }">
            <div class="flex flex-column align-items-center p-5 surface-overlay border-round">
                <div
                    class="border-circle bg-primary inline-flex justify-content-center align-items-center h-6rem w-6rem -mt-8">
                    <i class="pi pi-question text-5xl"></i>
                </div>
                <span class="font-bold text-2xl block mb-2 mt-4">{{ message.header }}</span>
                <p class="mb-0">{{ message.message }}</p>
                <div class="flex align-items-center gap-2 mt-4">
                    <Button label="Com Preço" @click="acceptCallback"></Button>
                    <Button label="Sem Preço" @click="rejectCallback"></Button>
                </div>
            </div>
        </template>
    </ConfirmDialog>
</template>

<style>
/* Seus estilos CSS aqui */
</style>
