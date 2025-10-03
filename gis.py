import rasterio
from rasterio.warp import transform
import matplotlib.pyplot as plt

tif_path = "/home/paolo/WildfireSpreadTS/2021/fire_25639646/2021-10-09.tif"

with rasterio.open(tif_path) as src:
    fig, axes = plt.subplots(5, 5, figsize=(15, 15))
    axes = axes.flatten()

    print("CRS:", src.crs)
    print("Bounds:", src.bounds)  # (minx, miny, maxx, maxy)

    # Get corner coordinates in source CRS
    minx, miny, maxx, maxy = src.bounds
    corners_x = [minx, maxx, minx, maxx]
    corners_y = [maxy, maxy, miny, miny]
    labels = ["Upper Left", "Upper Right", "Lower Left", "Lower Right"]

    # Transform to lat/lon (EPSG:4326)
    lon, lat = transform(src.crs, "EPSG:4326", corners_x, corners_y)

    for l, lo, la in zip(labels, lon, lat):
        print(f"{l}: longitude={lo:.6f}, latitude={la:.6f}")

    # Plot bands
    for i in range(1, src.count + 1):
        band = src.read(i)
        axes[i-1].imshow(band, cmap="gray")
        axes[i-1].set_title(f"Band {i}")
        axes[i-1].axis("off")

    # Hide unused axes
    for j in range(src.count, len(axes)):
        axes[j].axis("off")

    # Band metadata
    for i in range(1, src.count + 1):
        desc = src.descriptions[i-1] if src.descriptions else None
        print(f"Band {i}: {desc} dtype={src.dtypes[i-1]}")

    plt.tight_layout()
    plt.savefig("all_bands.png", dpi=200)
