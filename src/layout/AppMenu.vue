<script setup>
import { ref, watch, onMounted } from 'vue';
import AppMenuItem from './AppMenuItem.vue';
import { instanceLocalServer } from '../service/axios';

const roles = JSON.parse(localStorage.getItem("session"));

const userRoles = async () => {
    try {
        const response = await instanceLocalServer.get(`/user/role/${roles.uuid}`);
        return response.data.role;
    } catch (err) {
        console.error(err);
        return [];
    }
};

const model = ref([
    {
        label: 'Integrações',
        role: ["integracoes"],
        items: [
            {
                label: 'Bimer',
                role: ["integracoes_bimer"],
                items: [
                    {
                        label: 'Cadastro de Cliente',
                        icon: 'pi pi-fw pi-user',
                        to: '/painel/bimer/cadastro-pessoa'
                    },
                    {
                        label: 'Orçamento Rápido',
                        icon: 'pi pi-fw pi-comment',
                        to: '/painel/bimer/orcamento-rapido'
                    }
                ]
            }
        ]
    },
    {
        label: 'Configurações',
        role: ["configuracoes"],
        items: [
            {
                label: 'Usuários',
                role: ["configuracoes_usuarios"],
                items: [
                    {
                        label: 'Cadastro de Usuários',
                        icon: 'pi pi-fw pi-user',
                        to: '/painel/configs-gerais/usuarios'
                    }
                ]
            }
        ]
    },
    {
        label: 'Ferramentas',
        role: ["ferramentas"],
        items: [
            {
                label: 'Redimensionar Imagens',
                icon: 'pi pi-fw pi-arrow-up-right-and-arrow-down-left-from-center',
                to: '/painel/ferramentas/redimensiona-imagem'
            }
        ]
    }
]);

const toArray = (value) => {
    console.log(`Converting to array: ${value}`);
    return Array.isArray(value) ? value : [value];
};

const filterModel = (items, userRolesArray, parentRoles = []) => {
    console.log(`Filtering items with parent roles: ${parentRoles}`);
    return items.reduce((filtered, item) => {
        // Garantir que item.role é um array
        const itemRoles = toArray(item.role);
        console.log(`Item roles: ${itemRoles}`);
        
        // Combinar roles do pai com os roles do item
        const rolesToCheck = parentRoles.concat(itemRoles);
        console.log(`Roles to check: ${rolesToCheck}`);
        
        // Verificar se pelo menos um role do item está em userRoles
        const hasAccess = rolesToCheck.some(role => userRolesArray.includes(role));
        console.log(`Has access: ${hasAccess} (Roles to check: ${rolesToCheck}, User roles: ${userRolesArray})`);
        
        if (hasAccess) {
            const filteredItem = { ...item };
            console.log(`Filtered item: ${JSON.stringify(filteredItem)}`);
            
            if (filteredItem.items) {
                filteredItem.items = filterModel(filteredItem.items, userRolesArray, rolesToCheck);
            }
            
            filtered.push(filteredItem); // Aqui estamos adicionando itens ao array filtered
        }

        return filtered;
    }, []); // Inicializar 'filtered' como um array vazio
};

const initialize = async () => {
    const userRolesArray = await userRoles();
    console.log(`User roles: ${userRolesArray}`);

    const filteredModelValue = filterModel(model.value, userRolesArray);
    console.log(`Filtered model: ${JSON.stringify(filteredModelValue)}`);

    filteredModel.value = filteredModelValue;
};

const filteredModel = ref([]);

onMounted(() => {
    initialize();
});

watch(filteredModel, (newVal) => {
    console.log('Filtered model updated:', newVal);
});
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in filteredModel" :key="i">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
