<script setup>
  import { ref, reactive, onMounted } from 'vue';

  const user = reactive({
    name: '',
    email: '',
    password: '',
    role: null,
    status: 'Ativo',
  });
  
  const confirmPassword = ref('');
  const users = ref([]);
  const roles = [
    { label: 'Admin', value: 1 },
    { label: 'User', value: 2 },
  ];
  
  const fetchUsers = () => {
    // Fetch users from API (filter by uid of logged in user's account)
    // For demo purposes, we'll use static data
    users.value = [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 1, status: 'Ativo' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 2, status: 'Inativo' },
    ];
  };
  
  const saveUser = () => {
    if (user.password !== confirmPassword.value) {
      alert('Senhas não conferem');
      return;
    }
    if (user.id) {
      // Update user API call
      const index = users.value.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users.value[index] = { ...user };
      }
    } else {
      // Create user API call
      user.id = Date.now(); // Mock ID
      users.value.push({ ...user });
    }
    resetForm();
  };
  
  const editUser = (userData) => {
    Object.assign(user, userData);
    confirmPassword.value = user.password;
  };
  
  const toggleStatus = (userData) => {
    userData.status = userData.status === 'Ativo' ? 'Inativo' : 'Ativo';
    // Update user status API call
  };
  
  const resetForm = () => {
    user.name = '';
    user.email = '';
    user.password = '';
    user.role = null;
    user.status = 'Ativo';
    confirmPassword.value = '';
  };
  
  const roleTemplate = (rowData) => {
    return rowData.role === 1 ? 'Admin' : 'User';
  };
  
  const statusTemplate = (rowData) => {
    return rowData.status;
  };
  
  const actionTemplate = (rowData) => {
  return `
    <div>
      <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="() => editUser(rowData)" />
      <Button icon="${rowData.status === 'Ativo' ? 'pi pi-times' : 'pi pi-check'}" class="p-button-rounded p-button-warning" @click="() => toggleStatus(rowData)" />
      </div>
  `;
};

  onMounted(fetchUsers);
  </script>
<template>
    <div class="card">
      <h5>Cadastro de Usuário</h5>
      <div class="form-group">
        <div class="field col-12 md:col-6">
          <InputGroup>
            <InputGroupAddon><i class="pi pi-user"></i></InputGroupAddon>
            <InputText v-model="user.name" placeholder="Nome" required />
          </InputGroup>
        </div>
        <div class="field col-12 md:col-6">
          <InputGroup>
            <InputGroupAddon><i class="pi pi-envelope"></i></InputGroupAddon>
            <InputText v-model="user.email" placeholder="Email" required />
          </InputGroup>
        </div>
        <div class="field col-12 md:col-6">
          <InputGroup>
            <InputGroupAddon><i class="pi pi-lock"></i></InputGroupAddon>
            <Password v-model="user.password" placeholder="Senha" feedback="false" />
          </InputGroup>
        </div>
        <div class="field col-12 md:col-6">
          <InputGroup>
            <InputGroupAddon><i class="pi pi-lock"></i></InputGroupAddon>
            <Password v-model="confirmPassword" placeholder="Confirmação de Senha" feedback="false" />
          </InputGroup>
        </div>
        <div class="field col-12 md:col-6">
          <InputGroup>
            <InputGroupAddon><i class="pi pi-user-edit"></i></InputGroupAddon>
            <Dropdown v-model="user.role" :options="roles" optionLabel="label" optionValue="value" placeholder="Perfil de Usuário" />
          </InputGroup>
        </div>
        <div class="field col-12 md:col-6">
          <Button label="Salvar" icon="pi pi-save" @click="saveUser" class="mr-2" />
          <Button label="Cancelar" icon="pi pi-times" class="p-button-secondary" @click="resetForm" />
        </div>
      </div>
      <h5>Usuários Cadastrados</h5>
      <DataTable :value="users">
        <Column field="name" header="Nome" />
        <Column field="email" header="Email" />
        <Column field="role" header="Perfil" :body="roleTemplate" />
        <Column field="status" header="Status" :body="statusTemplate" />
        <Column header="Ações" :body="actionTemplate" />
      </DataTable>
    </div>
  </template>
  
  
  
  <style scoped>
  .field {
    margin-bottom: 1rem;
  }
  </style>
  