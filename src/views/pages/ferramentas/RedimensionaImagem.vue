<script setup>
import { ref } from 'vue';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import FileUpload from 'primevue/fileupload';

const width = ref(0);
const height = ref(0);
const baseName = ref('');
const loading = ref(false);
const format = ref('jpg');

const resizeImages = async (event) => {
    console.log(event);
    loading.value = true;
    const zip = new JSZip();
    const promises = event.files.map((file, index) => {
        console.log(file);
        const imageName = `${baseName.value ? baseName.value + '_' : 'imagem_'}${index + 1}`;
        return resizeImage(file, width.value, height.value, imageName);
    });

    const resizedBlobs = await Promise.all(promises);
    resizedBlobs.forEach(({ blob, name }) => {
        zip.file(`${name}.${format.value}`, blob);
    });

    zip.generateAsync({ type: 'blob' }).then((content) => {
        const archiveName = `${baseName.value ? baseName.value : 'imagens_redimensionadas'}`;
        saveAs(content, archiveName + '.zip');
        loading.value = false;
    });
};

const resizeImage = (file, targetWidth, targetHeight, name) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // Calculate the new dimensions of the image
                const imgAspectRatio = img.width / img.height;
                const targetAspectRatio = targetWidth / targetHeight;

                let newWidth, newHeight;
                if (imgAspectRatio > targetAspectRatio) {
                    newWidth = targetWidth;
                    newHeight = targetWidth / imgAspectRatio;
                } else {
                    newHeight = targetHeight;
                    newWidth = targetHeight * imgAspectRatio;
                }

                // Fill canvas with white background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, targetWidth, targetHeight);

                // Draw the image in the center of the canvas
                const offsetX = (targetWidth - newWidth) / 2;
                const offsetY = (targetHeight - newHeight) / 2;
                ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

                canvas.toBlob(
                    (blob) => {
                        // Convert to 24 bits per pixel for JPEG
                        if (format.value === 'jpg') {
                            const offscreenCanvas = new OffscreenCanvas(targetWidth, targetHeight);
                            const offscreenCtx = offscreenCanvas.getContext('2d');

                            offscreenCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
                            offscreenCanvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 }).then((jpegBlob) => {
                                resolve({ blob: jpegBlob, name });
                            });
                        } else {
                            resolve({ blob, name });
                        }
                    },
                    `image/${format.value}`,
                    0.9
                );
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

</script>

<template>
    <div class="card">
        <h5>Redimensiona Imagem</h5>
        <div class="flex flex-wrap">
            <div class="field col-6 md:col-3">
                <InputGroup>
                    <InputGroupAddon><i class="pi pi-arrows-h"></i></InputGroupAddon>
                    <InputNumber v-model.number="width" type="number" class="form-control" id="width"
                        placeholder="Largura(px)" required />
                    <InputGroupAddon>px</InputGroupAddon>
                </InputGroup>
            </div>
            <div class="field col-6 md:col-3">
                <InputGroup>
                    <InputGroupAddon><i class="pi pi-arrows-v"></i></InputGroupAddon>
                    <InputNumber v-model.number="height" type="number" class="form-control" id="height"
                        placeholder="Altura(px)" required />
                    <InputGroupAddon>px</InputGroupAddon>
                </InputGroup>
            </div>
            <div class="field col-12 md:col-3">
                <InputGroup>
                    <InputGroupAddon><i class="pi pi-file-edit"></i></InputGroupAddon>
                    <InputText v-model="baseName" type="text" class="form-control" id="baseName"
                        placeholder="Nome Imagem" />
                </InputGroup>
            </div>
            <div class="field col-12 md:col-3">
                <InputGroup>
                    <InputGroupAddon><i class="pi pi-image"></i></InputGroupAddon>
                    <Dropdown v-model="format" :options="['jpg', 'png', 'webp']" placeholder="Escolha o formato" />
                </InputGroup>
            </div>
            <div class="col-12 md:col-12">
                <FileUpload name="files[]" @uploader="resizeImages" url="./" :multiple="true" customUpload="true"
                    accept="image/*" :maxFileSize="1000000" uploadLabel="Converter" chooseLabel="Inserir Imagens">
                    <template #empty>
                        <div
                            class="flex align-items-center justify-content-center flex-column border-2 border-300 border-dashed border-round p-5 bg-blue-50">
                            <i class="pi pi-cloud-upload border-2 border-circle p-5 text-8xl text-400 border-400" />
                            <p class="mt-4 mb-0">Arraste suas imagens aqui para converter</p>
                        </div>
                    </template>
                    <template #uploadicon>
                        <i class="pi pi-window-maximize mr-2"></i>
                    </template>
                </FileUpload>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
