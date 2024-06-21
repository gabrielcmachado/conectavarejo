import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/painel',
            component: AppLayout,
            meta: { requiresAuth: true },
            children: [
                {
                    path: 'painel/bimer',
                    name: 'Bimer',
                    meta: {requiresAuth: true},
                    children: [
                        {
                            path: '/painel/bimer/cadastro-pessoa',
                            name: 'Cadastro',
                            component: () => import('@/views/pages/modulos/bimer/CadastroPessoa.vue')
                        },
                        {
                            path: '/painel/bimer/orcamento-rapido',
                            name: 'OrcamentoRapido',
                            component: () => import('@/views/pages/modulos/bimer/OrcamentoRapido.vue')
                        }
                    ]
                },
            ]
        },
        {
            path: '/landing',
            name: 'landing',
            component: () => import('@/views/pages/Landing.vue')
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },
        {
            path: '/auth/register',
            name: 'register',
            component: () => import('@/views/pages/auth/Register.vue')
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        const accessToken = JSON.parse(localStorage.getItem('session')).accessToken;
        if (!accessToken) {
            next({ name: 'login' });
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;
