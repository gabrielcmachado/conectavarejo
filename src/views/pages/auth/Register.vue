<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useRouter } from 'vue-router';
import { instanceLocalServer } from '../../../service/axios';
import { useToast } from 'primevue/usetoast';

const { layoutConfig } = useLayout();
const email = ref('');
const password = ref('');
const nome = ref('');
const error = ref('');
const router = useRouter();
const toast = useToast();

const showMessageTime = (severity, summary, detail, life) => {
    toast.add({ severity: severity, summary: summary, detail: detail, life: life });
};

const register = async () => {
    try {
        const response = await instanceLocalServer.post('account/new', {
            nome: nome.value,
            emailCobranca: email.value,
            user: {
                name: nome.value,
                email: email.value,
                password: password.value
            }
        });
        await showMessageTime('success', 'Conta Criada Sucesso', response.data.id, 1000);

        router.push('/');
    } catch (err) {
        error.value = err.response ? err.response.data.message : 'An error occurred';
        showMessageTime('error', 'Erro Desconhecido', error.value, 5000);
    }
};

const logoUrl = computed(() => {
    return `/layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});
</script>

<template>
    <Toast />
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img :src="logoUrl" class="mb-5 w-28rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 50%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Crie sua conta!</div>
                        <span class="text-600 font-medium">Insira seus dados para começar</span>
                    </div>
                    <form @submit.prevent="register">
                        <div>
                            <label for="nome" class="block text-900 text-xl font-medium mb-2">Nome</label>
                            <InputText id="nome" type="text" placeholder="Insira seu nome ..." class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="nome" />

                            <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
                            <InputText id="email1" type="text" placeholder="Insira seu email ..." class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" />

                            <label for="password1" class="block text-900 font-medium text-xl mb-2">Senha</label>
                            <Password id="password1" v-model="password" placeholder="Crie uma senha segura ..." :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>

                            <div class="flex align-items-center justify-content-between mb-5 gap-5">
                                <router-link to="/">
                                    <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Já tem uma conta? Faça Login</a>
                                </router-link>
                            </div>
                            <Button label="Criar agora" type="submit" class="w-full p-3 text-xl"></Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
