import folder_paths
from nodes import SaveImage

class ManualDownloadNode(SaveImage):
    def __init__(self):
        # Inicializamos usando la carpeta TEMP en lugar de OUTPUT
        self.output_dir = folder_paths.get_temp_directory()
        self.type = "temp"
        self.prefix_append = "mx"
        self.compress_level = 4

    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "images": ("IMAGE", ),
                # CAMBIO: Un nombre por defecto seguro
                "filename_prefix": ("STRING", {"default": "ComfyUI_Temp"}), 
            },
            "hidden": {"prompt": "PROMPT", "extra_pnginfo": "EXTRA_PNGINFO"},
        }

    RETURN_TYPES = ()
    OUTPUT_NODE = True
    CATEGORY = "Custom/UI"
    FUNCTION = "save_images"
    
    # Heredamos la función save_images original de ComfyUI
    # pero al tener self.type="temp", se guardará en temp.

NODE_CLASS_MAPPINGS = { "ManualDownloadNode": ManualDownloadNode }
NODE_DISPLAY_NAME_MAPPINGS = { "ManualDownloadNode": "Boton Descarga" }
WEB_DIRECTORY = "./web"