<script setup>
import { ref, watchEffect } from 'vue';
import { instanceLocalServer } from '../../../../service/axios';
import cpfCheck from 'cpf-check';
import { useToast } from 'primevue/usetoast';

const cpf = ref('');
const nome = ref('');
const celular = ref('');
const isCadastrado = ref(false);
const cpfInvalido = ref(false);
const formIsValid = ref(false);
const toast = useToast();
const opcoesConsulta = ref(['celular', 'fixo']);
const opcaoSelecionada = ref('celular');

const validarCPF = () => {
    const cpfNumerico = cpf.value.replace(/\D/g, '');
    cpfInvalido.value = !cpfCheck.validate(cpfNumerico);
    return !cpfCheck.validate(cpfNumerico);
};
const zeraForm = () => {
    cpf.value = '';
    nome.value = '';
    celular.value = '';
    nomeVendedor.value = '';
    isCadastrado.value = '';
};

const nomeVendedores = ref([
    { code: 'helena', name: 'Helena' },
    { code: 'delcy', name: 'Delcy' },
    { code: 'rosa', name: 'Rosa' },
    { code: 'nilson', name: 'Nilson' },
    { code: 'lucia', name: 'Lúcia' },
    { code: 'outros', name: 'Outros' }
]);
const nomeVendedor = ref(null);

const showMessageTime = (severity, summary, detail, life) => {
    toast.add({ severity: severity, summary: summary, detail: detail, life: life });
};
const showMessage = (severity, summary, detail) => {
    toast.add({ severity: severity, summary: summary, detail: detail });
};

const verificarCadastro = async () => {
    showMessageTime('info', 'Aguarde', 'Localizando Aguarde', 1500);
    if (localStorage.getItem('bimer_token')) {
        instanceLocalServer.defaults.headers.Authorization = localStorage.getItem('bimer_token');
    }

    try {
        const response = await instanceLocalServer.get(`bimer/api/pessoas?cpfCnpj=${cpf.value.replace(/\D/g, '')}`);
        localStorage.setItem('bimer_token', response.data.tokenBimer.split(' ')[1]);

        if (response.data.resposta.ListaObjetos) {
            showMessageTime('info', 'Pessoa já Cadastrada', `A pessoa ${response.data.resposta.ListaObjetos[0].Nome} já está cadastrada com o código: ${response.data.resposta.ListaObjetos[0].Codigo}`, 5000);
            isCadastrado.value = true;
        }
    } catch (error) {
        if (error.response.data.resposta.Erros) {
            if (error.response.data.resposta.Erros[0].ErrorCode == 'E400') {
                isCadastrado.value = false;
                showMessageTime('warn', 'Cliente Não Cadastrado', 'Prossiga com o cadastro', 3000);
            } else {
                showMessage('error', 'Erro Desconhecido', error.message);
            }
        }
    }
};

function copiarParaAreaDeTransferencia(conteudo) {
    // Cria um elemento de texto temporário
    const elementoTemporario = document.createElement('textarea');

    // Define o valor do elemento para o conteúdo desejado
    elementoTemporario.value = conteudo;

    // Adiciona o elemento temporário ao corpo do documento
    document.body.appendChild(elementoTemporario);

    // Seleciona e copia o conteúdo para a área de transferência
    elementoTemporario.select();
    document.execCommand('copy');

    // Remove o elemento temporário
    document.body.removeChild(elementoTemporario);
}

const submitForm = async () => {
    try {
        let pessoa = [
            {
                ContatoPrincipal: true,
                Nome: nome.value.split(' ')[0],
                TipoCadastro: 'I'
            }
        ];

        if (opcaoSelecionada.value === 'celular') {
            pessoa[0].TelefoneCelular = celular.value;
            console.log(pessoa);
        } else {
            pessoa[0].TelefoneFixo = celular.value;
            console.log(pessoa);
        }

        let endereco = [
            {
                CEP: '26130-000',
                IdentificadorBairro: '00A0000001',
                IdentificadorCidade: '00A000056N',
                IdentificadorTipoLogradouro: '00A000006H',
                NomeLogradouro: 'Av. Benjamin Pinto Dias',
                NumeroLogradouro: '1324',
                InscricaoEstadual: 'ISENTO',
                Observacao: 'Cadastrado via API',
                SiglaUnidadeFederativa: 'RJ',
                PessoasContato: pessoa,
                TipoCadastro: 'I',
                Tipos: {
                    Cobranca: true,
                    Comercial: true,
                    Correspondencia: true,
                    Entrega: true,
                    Principal: true,
                    Residencial: true
                }
            }
        ];

        let data = {
            Enderecos: endereco,
            Tipo: 'F',
            CpfCnpj: cpf.value.replace(/\D/g, ''),
            Nome: nome.value
        };

        let options = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            data: data,
            url: `bimer/api/clientes/`
        };

        const response = await instanceLocalServer(options);
        let vendedorSelecionado = '';
        switch (nomeVendedor.value.code) {
            case 'helena':
                vendedorSelecionado = '00A0000016';
                break;
            case 'delcy':
                vendedorSelecionado = '00A0000014';
                break;
            case 'rosa':
                vendedorSelecionado = '00A0000017';
                break;
            case 'lucia':
                vendedorSelecionado = '00A0000015';
                break;
            default:
                vendedorSelecionado = '00A0000012';
                break;
        }

        await instanceLocalServer({
            url: `bimer/api/pessoas/${response.data.resposta.ListaObjetos[0].Identificador}/caracteristicas`,
            method: 'POST',
            data: {
                IdentificadorCaracteristica: vendedorSelecionado
            },
            headers: { 'content-type': 'application/json' }
        });
        showMessageTime('success', 'Cliente Cadastrado', `A pessoa ${response.data.resposta.ListaObjetos[0].Nome.split(' ')[0]} foi cadastrada com sucesso e o seu código é ${response.data.resposta.ListaObjetos[0].Codigo}`, 1000000);
        zeraForm();
        copiarParaAreaDeTransferencia(response.data.resposta.ListaObjetos[0].Codigo);
    } catch (error) {
        if (error.response.data.Erros[0].ErrorCode == 'E400') {
            showMessageTime('error', 'Erro no Cadastro', `A pessoa com o CPF informado já foi cadastrada.`, 1000000);
        }

        console.error('Erro ao enviar formulário:', error);
    }
};

watchEffect(() => {
    formIsValid.value = cpf.value && nome.value && celular.value && nomeVendedor.value && !isCadastrado.value && !validarCPF();
});
</script>

<template>
    <Toast />
    <div class="card">
        <h5>Cadastro Simplificado</h5>
        <div class="p-fluid mt-3">
            <form @submit.prevent="submitForm" class="flex flex-wrap">
                <div class="field col-12 md:col-6">
                    <InputGroup>
                        <span class="p-float-label">
                            <InputMask v-model="cpf" aria-describedby="statusCPF" id="cpf" @keyup="validarCPF" mask="999.999.999-99" required />
                            <label for="cpf">CPF</label>
                        </span>
                            <Button style="padding-right:10px; width:150px;" v-if="cpfInvalido" disabled icon="pi pi-check" type="button" @click="verificarCadastro" label="Verificar" />
                            <Button style="padding-right:10px;width:150px;" v-else icon="pi pi-check" type="button" @click="verificarCadastro" label="Verificar" />
                    </InputGroup>
                </div>
                <div class="field col-12 md:col-6">
                    <div class="p-inputgroup">
                        <span class="p-inputgroup-addon">
                            <i class="pi pi-user"></i>
                        </span>
                        <span class="p-float-label">
                            <InputText type="text" placeholder="Digite o nome do cliente" id="nome" v-model="nome" />
                            <label for="nome">Nome</label>
                        </span>
                    </div>
                </div>
                <div class="field col-12 md:col-4">
                    <SelectButton v-model="opcaoSelecionada" :options="opcoesConsulta" />
                </div>
                <div class="field col-12 md:col-4">
                    <div class="p-inputgroup">
                        <span class="p-inputgroup-addon">
                            <i class="pi pi-whatsapp"></i>
                        </span>
                        <span class="p-float-label">
                            <InputMask v-model="celular" type="text" id="celular" mask="99999999999" required />
                            <label for="celular">Contato</label>
                        </span>
                    </div>
                </div>
                <div class="field col-12 md:col-4">
                    <div class="p-inputgroup">
                        <span class="p-inputgroup-addon">
                            <i class="pi pi-heart-fill"></i>
                        </span>
                            <Dropdown v-model="nomeVendedor" id="nomeVendedor" optionLabel="name" :options="nomeVendedores" placeholder="Selecione um vendedor" required></Dropdown>
                    </div>
                </div>
                <div class="field col-12 md:col-12">
                    <Button :disabled="!formIsValid" type="submit" class="btn btn-success justify-content-center">Enviar</Button>
                </div>
            </form>
        </div>
    </div>
</template>
