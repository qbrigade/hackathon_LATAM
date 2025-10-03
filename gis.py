import rasterio
import matplotlib.pyplot as plt
#Modify path for your .tiff image
tif_path = "2018-01-25.tif"

with rasterio.open(tif_path) as src:
    fig, axes = plt.subplots(5, 5, figsize=(15, 15))
    axes = axes.flatten()

    for i in range(1, src.count + 1):
        band = src.read(i)
        axes[i-1].imshow(band, cmap="gray")
        axes[i-1].set_title(f"Band {i}")
        axes[i-1].axis("off")

    # Apagar ejes vacíos si hay más subplots que bandas
    for j in range(src.count, len(axes)):
        axes[j].axis("off")
        
    for i in range(1, src.count + 1):
        desc = src.descriptions[i-1] if src.descriptions else None
        print(f"Band {i}: {desc} dtype={src.dtypes[i-1]}")

    plt.tight_layout()
    plt.savefig("all_bands.png", dpi=200)
