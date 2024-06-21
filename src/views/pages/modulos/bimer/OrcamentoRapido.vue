<script setup>
import { ref, watchEffect, onBeforeMount } from 'vue';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { instanceLocalServer, blankInstance } from '../../../../service/axios.js';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import { PrimeIcons } from '@primevue/core/api';
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
const urlEnvio = ref('https://hook.us1.make.com/54rxy6nyaolwu3gx82eftyspmojl7rov');
const telefone = ref('');
const produtos = ref([{ produto: '', quantidade: 1, codigo: '', valorUnitario: 0.0, valorTotal: 0.0 }]);
const produtosEncontrados = ref([{ produto: '', codigo: '', valorUnitario: 0 }]);
const sugestoesProdutos = ref([]);
const empresas = ref([]);
const idempresa = ref('');
const empresasEncontradas = ref([]);
const idSetorBimer = ref('');
const setoresBimer = ref('');
const operacoesBimer = ref('');
const idOperacaoBimer = ref('');
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
    { code: 'outros', name: 'Outros' }
]);
const dialogVisible = ref(false);
const dialogConversaoVisible = ref(false);
const vendedor = ref(null);
const totalOrcamento = ref(0);
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
const processaInfosOperacao = (val) => {
    try {
        const resultado = operacoesEncontradas.value.find((e) => {
            return e.codigo.trim() === val.value.split('-')[0].trim(); // Adiciona o return para a comparação
        });
        console.log(resultado);
        if (resultado) {
            console.log(resultado);
        }
    } catch (error) {
        console.error('Erro ao buscar setores:', error);
        return [];
    }
};
// FIM DE ROTINA AUTOCOMPLETE SETORES

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
            console.log(empresaSelecionada);
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

        console.log(produto);
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
            produtosFormatados = produtos.value.map((produto) => `${produto.codigo} - ${produto.produto} \n Quantidade: ${produto.quantidade}`).join('\n \n');
        } else {
            produtosFormatados = produtos.value
                .map((produto) => `${produto.codigo} - ${produto.produto} \n ${formatCurrency(parseFloat(produto.valorUnitario))} x ${produto.quantidade} = ${formatCurrency(parseFloat(produto.valorTotal))}`)
                .join('\n \n');
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
        totalOrcamento.value = 0;
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
    console.log(typeof value + value);
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
    console.log(orcamento);
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
        produtosFormatados = orcamentoSelecionado.value.ProdutosOrcamentos.map((produto) => `${produto.codigo} - ${produto.nome} \n Quantidade: ${produto.quantidade}`).join('\n \n');
    } else {
        produtosFormatados = orcamentoSelecionado.value.ProdutosOrcamentos.map(
            (produto) => `${produto.codigo} - ${produto.nome} \n ${formatCurrency(produto.valorunitario)} x ${produto.quantidade} = ${formatCurrency(produto.valorunitario * produto.quantidade)}`
        ).join('\n \n');
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
    console.log(orcamento)
    const cliente = await instanceLocalServer.get(`bimer/consulta-cliente-telefone?query=${orcamento.telefone}`)
    console.log(cliente)

    dialogConversaoVisible.value = true;
};

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
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon">
                                    <i class="pi pi-user"></i>
                                </span>
                                <span class="p-float-label">
                                    <InputText v-model="nome" id="nome" required />
                                    <label for="nome">Nome</label>
                                </span>
                            </div>
                        </div>
                        <div class="field col-12 md:col-4">
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon">
                                    <i class="pi pi-whatsapp"></i>
                                </span>
                                <span class="p-float-label">
                                    <InputMask v-model="telefone" id="telefone" mask="99999999999" required />
                                    <label for="telefone">Telefone</label>
                                </span>
                            </div>
                        </div>

                        <div class="field col-12 md:col-4">
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon">
                                    <i class="pi pi-heart-fill"></i>
                                </span>
                                <span class="p-float-label">
                                    <Select v-model="vendedor" id="vendedor" optionLabel="name"
                                        :options="nomeVendedores" placeholder="Selecione um vendedor " required>
                                    </Select>
                                </span>
                            </div>
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
                <div v-for="(produto, index) in produtos" :key="index" class="field col-12 md:col-12 mt-3"
                    style="padding-top: 1px; padding-bottom: 1px">
                    <div class="p-inputgroup">
                        <span class="p-inputgroup-addon">
                            <i class="pi pi-box"></i>
                        </span>
                        <label class="p-inputgroup-addon">cod: <br />{{ produtos[index].codigo }}</label>
                        <label class="p-inputgroup-addon">Vl.Uni: <br />
                            R$ {{ produtos[index].valorUnitario }}</label>
                        <AutoComplete style="width: 45%" v-model="produtos[index].produto" @loading="true"
                            @complete="fetchProdutos" :suggestions="sugestoesProdutos"
                            placeholder="Digite para buscar produtos" :id="'produto-' + index"
                            @item-select="preencherInfos($event, index)" />
                        <InputNumber style="width: 5%" v-model="produtos[index].quantidade" mode="decimal"
                            @update:modelValue="calcularTotalItem(index)" />
                        <label class="p-inputgroup-addon">Vl.Total: <br />
                            R$ {{ produtos[index].valorTotal }}</label>
                        <span class="p-buttonset">
                            <Button type="button" @click="adicionarProduto" icon="pi pi-plus-circle"
                                class="p-button-success"></Button>
                            <Button v-if="produtos.length > 1" type="button" @click="removerProduto(index)"
                                icon="pi pi-trash" class="p-button-danger"></Button>
                            <Button v-if="produtos.length === 1" type="button" @click="removerProduto(index)"
                                icon="pi pi-trash" class="p-button-danger" disabled></Button>
                        </span>
                    </div>
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
                        <DatePicker v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="dd/mm/yyyy" />
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
    <Dialog v-model:visible="dialogConversaoVisible" modal
        header="Gerar Pedido/Pré-pedido | Empresa: {orcamentoSelecionado.dadosEmpresa.empresa.nome}" class="m-5">
        <div class="p-fluid mt-0" style="margin-top:-20px!important">
            <form @submit.prevent="submitForm" class="flex flex-wrap">
                <div class="flex flex-wrap col-12 md:col-12 mt-0">
                    <div class="field col-12 md:col-6">
                        <label for="idCliente">Cliente</label>
                        <div class="flex">
                        <AutoComplete id="idCliente" v-model="idCliente" dropdown :suggestions="cliente"
                            @complete="fetchCliente" @item-select="processaInfosCliente($event)"/>
                        <Button icon="pi pi-star" class="p-button-sucess" />
                        </div>
                    </div>
                    <div class="field col-12 md:col-6">
                        <label for="idOperacaoBimerVendas">Operação</label>
                        <AutoComplete id="idOperacaoBimerVendas" v-model="idOperacaoBimerVendas" dropdown :suggestions="operacoesBimer"
                            @complete="fetchPrecosBimer" @item-select="processaInfosPrecos($event)" />
                    </div>
                </div>
                <!-- <div class="col-12 md:col-12 flex flex-wrap" style="margin-top:-20px!important">
                    <DataTable
                    ref="dt"
                    :value="products"
                    v-model:selection="selectedProducts"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                   :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[5, 10, 25]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                >
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Products</h5>
                            <IconField iconPosition="left" class="block mt-2 md:mt-0">
                                <InputIcon class="pi pi-search" />
                                <InputText class="w-full sm:w-auto" v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                    <Column field="code" header="Code" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Code</span>
                            {{ slotProps.data.code }}
                        </template>
                    </Column>
                    <Column field="name" header="Name" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Name</span>
                            {{ slotProps.data.name }}
                        </template>
                    </Column>
                    <Column header="Image" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Image</span>
                            <img :src="'/demo/images/product/' + slotProps.data.image" :alt="slotProps.data.image" class="shadow-2" width="100" />
                        </template>
                    </Column>
                    <Column field="price" header="Price" :sortable="true" headerStyle="width:14%; min-width:8rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Price</span>
                            {{ formatCurrency(slotProps.data.price) }}
                        </template>
                    </Column>
                    <Column field="category" header="Category" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Category</span>
                            {{ slotProps.data.category }}
                        </template>
                    </Column>
                    <Column field="rating" header="Reviews" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Rating</span>
                            <Rating :modelValue="slotProps.data.rating" :readonly="true" :cancel="false" />
                        </template>
                    </Column>
                    <Column field="inventoryStatus" header="Status" :sortable="true" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Status</span>
                            <Tag :severity="getBadgeSeverity(slotProps.data.inventoryStatus)">{{ slotProps.data.inventoryStatus }}</Tag>
                        </template>
                    </Column>
                    <Column headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="mr-2" severity="success" rounded @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="mt-2" severity="warning" rounded @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
                </div> -->
            </form>
        </div>
        <div>

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
