import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

app.registerExtension({
    name: "Comfy.ManualDownloadButtonForce",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (nodeData.name === "ManualDownloadNode") {
            
            const onNodeCreated = nodeType.prototype.onNodeCreated;
            nodeType.prototype.onNodeCreated = function () {
                if (onNodeCreated) onNodeCreated.apply(this, arguments);
                
                const node = this;
                node.downloadable_image = null; // Variable de respaldo

                // --- LISTENER GLOBAL DE FUERZA BRUTA ---
                // Escuchamos directamente al núcleo de ComfyUI
                const listener = api.addEventListener("executed", ({ detail }) => {
                    // Verificamos si el nodo que terminó es ESTE nodo
                    if (detail?.node === String(node.id)) {
                        if (detail?.output?.images) {
                            // Guardamos la referencia inmediatamente
                            node.downloadable_image = detail.output.images[0];
                            
                            // Feedback visual opcional: Cambiar título
                            node.title = "✅ Imagen Lista (Clic en Botón)";
                        }
                    }
                });

                // Limpieza para no saturar memoria si borras el nodo
                const onRemoved = node.onRemoved;
                node.onRemoved = function() {
                    if (onRemoved) onRemoved.apply(this, arguments);
                    api.removeEventListener("executed", listener);
                };

                // --- BOTÓN ---
                this.addWidget("button", "⬇️ DESCARGAR AHORA", null, () => {
                    
                    // 1. Intentamos obtener la imagen de la variable global capturada
                    let img = node.downloadable_image;

                    // 2. Si falló, intentamos buscar en la propiedad estándar (backup)
                    if (!img && node.imgs && node.imgs.length > 0) {
                        img = node.imgs[0];
                    }

                    if (!img) {
                        alert("❌ No se encuentra la imagen.\n\n1. Asegúrate de haber ejecutado 'Queue Prompt'.\n2. Espera a que termine de generar.\n3. Si acabas de recargar la página, tienes que generar de nuevo.");
                        return;
                    }

                    // Construcción de URL a prueba de fallos
                    const filename = img.filename;
                    const type = img.type || "temp";
                    const subfolder = img.subfolder || "";
                    
                    const url = `/view?filename=${encodeURIComponent(filename)}&type=${type}&subfolder=${encodeURIComponent(subfolder)}`;

                    // Descarga
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
            };
        }
    },
});