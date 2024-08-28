<script setup>
import { ref, onMounted } from 'vue';
import { instanceLocalServer } from '../../../../service/axios';

// Dados das características fixas
const caracteristicas = [
    { caracteristica: 'Baixo Potencial', valor: 'BAIXO_POTENCIAL'},
    { caracteristica: 'Campeão se Despedindo', valor: 'CAMPEAO_DESPEDINDO'},
    { caracteristica: 'Campeão', valor: 'CAMPEAO'},
    { caracteristica: 'Carente', valor: 'CARENTE'},
    { caracteristica: 'Cliente Fiel', valor: 'CLIENTE_FIEL'},
    { caracteristica: 'Ex - Campeão', valor: 'EX_CAMPEAO'},
    { caracteristica: 'Fiel Abandonado', valor: 'FIEL_ABANDONADO'},
    { caracteristica: 'Perdido', valor: 'PERDIDO'},
    { caracteristica: 'Potencial Campeão', valor: 'PORENCIAL_CAMPEAO'},
    { caracteristica: 'Promessa', valor: 'PROMESSA'},
    { caracteristica: 'Recém Chegado', valor: 'RECEM_CHEGADO'},
    { caracteristica: 'Talento Desperdiçado', valor: 'TALENTO_DESPERDICADO'}
];
        
// Categorias e categoria selecionada
const categorias = ref([]);
const selectedCategorias = ref({});

// Função para buscar categorias
const fetchCategorias = async () => {
    try {
        const response = await instanceLocalServer.get('bimer/api/pessoas/caracteristicas');
        const data = response.data.ListaObjetos.map(obj => ({
            label: obj.Nome,
            value: obj.Identificador
        }));
        categorias.value = data;
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
    }
};

// Manipulador para mudança no dropdown
const handleDropdownChange = (caracteristica, categoriaSelecionada) => {
    selectedCategorias.value[caracteristica] = categoriaSelecionada;
    console.log(`Categoria selecionada para ${caracteristica}:`, categoriaSelecionada);
};

// Funções para gravar e editar
const gravar = () => {
    console.log('Gravar', selectedCategorias.value);
};

const editar = () => {
    console.log('Editar', selectedCategorias.value);
};

// Buscar categorias ao montar o componente
onMounted(() => {
    fetchCategorias();
});
</script>

<template>
    <Card>
        <template #content>
        <DataTable :value="caracteristicas" class="p-datatable-customers">
            <Column field="caracteristica" header="Característica Fixa"></Column>
            <Column header="Categoria Bimer">
                <template #body="{ data }">
                    <Dropdown :options="categorias" v-model="selectedCategorias[data.caracteristica]"
                        optionLabel="label" optionValue="value" placeholder="Selecione uma categoria"
                        @change="handleDropdownChange(data.caracteristica, $event.value)" />
                </template>
            </Column>
            <Column header="Opções">
                <template #body>
                    <Button label="Gravar" @click="gravar" class="p-mr-2" />
                    <Button label="Editar" @click="editar" />
                </template>
            </Column>
        </DataTable>

    </template>
    </Card>
</template>
