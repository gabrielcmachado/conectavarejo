<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { instanceLocalServer } from '../../../service/axios';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const { layoutConfig } = useLayout();
const email = ref('');
const password = ref('');
const checked = ref(false);
const error = ref(null);
const router = useRouter();
const toast = useToast();

const showMessageTime = (severity, summary, detail, life) => {
    toast.add({ severity: severity, summary: summary, detail: detail, life: life });
};

const login = async () => {
    try {
        const response = await instanceLocalServer.post('auth/login', {
            email: email.value,
            password: password.value
        });
        localStorage.setItem('session', JSON.stringify(response.data));
        router.push('/painel/bimer/cadastro-pessoa');
    } catch (err) {
        error.value = err.response ? err.response.data.message : 'An error occurred';
        showMessageTime('error', 'Erro de Login', error.value, 5000);
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
            <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-28rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 50%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <div class="text-900 text-3xl font-medium mb-3">Faça login</div>
                        <span class="text-600 font-medium">Insira seus dados de acesso</span>
                    </div>
                    <form @submit.prevent="login">
                        <div>
                            <label for="email1" class="block text-900 text-xl font-medium mb-2">Email</label>
                            <InputText id="email1" type="text" placeholder="Digite seu email..." class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="email" />

                            <label for="password1" class="block text-900 font-medium text-xl mb-2">Senha</label>
                            <Password id="password1" v-model="password" placeholder="Digite sua senha..." :toggleMask="true" class="w-full mb-3" inputClass="w-full" :inputStyle="{ padding: '1rem' }"></Password>

                            <div class="flex align-items-center justify-content-between mb-5 gap-5">
                                <div class="flex align-items-center">
                                    <Checkbox v-model="checked" id="rememberme1" binary class="mr-2"></Checkbox>
                                    <label for="rememberme1">Lembrar meu acesso</label>
                                </div>
                                <a class="font-medium no-underline ml-2 text-right cursor-pointer" style="color: var(--primary-color)">Esqueceu a senha?</a>
                            </div>
                            <Button type="submit" label="Entrar" class="w-full p-3 text-xl"></Button>
                            <router-link to="/auth/register">
                                <Button label="Não tem conta, crie agora" text class="w-full mt-3 p-3 text-xxl"></Button>
                            </router-link>
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
