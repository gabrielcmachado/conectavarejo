<script default>
import { ref } from 'vue';
import { instanceLocalServer } from '../../../../service/axios';
import { useToast } from 'primevue/usetoast';




const submitForm = async () => {
}

</script>

<template>
   <Toast />
   <div class="card">
        <h5>Enviar Nota Fiscal ou Cupom Fiscal</h5>
        <div class="p-fluid mt-3">
            <form @submit.prevent="submitForm" class="flex flex-wrap">
                <Fieldset legend="Dados do Orçamento" class="col-12 md:col-12">
                    <div class="flex flex-wrap">
                        <div class="field col-12 md:col-8">
                            <label for="idempresa">Empresa</label>
                            <AutoComplete id="idempresa" v-model="idempresa" dropdown :suggestions="empresas"
                                @complete="fetchEmpresas" @item-select="processaInfosEmpresa($event)" />
                        </div>
                        <div class="field col-12 md:col-4">
                            <label for="nrDocumento">Numero Documento</label>
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon">
                                    <i class="pi pi-spin pi-barcode"></i>
                                </span>
                                    <AutoComplete v-model="nrDocumento" id="nrDocumento" required />
                            </div>
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
                        <div class="field col-12 md:col-3">
                        <label>Enviar XML</label>
                        <SelectButton v-model="opcaoSelecionada" :options="opcoesConsulta" />
                    </div>
                    </div>
                </Fieldset>
                <div class="field col-12 md:col-12">
                    <Button type="submit" class="justify-content-center" :disabled="!submitButtonOrcStatus">Enviar
                        Orçamento</Button>
                </div>
            </form>
        </div>
    </div>

</template>

<style>

</style>