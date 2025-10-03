import rasterio
from rasterio.transform import xy
import numpy as np

def extract_fire_coords(tiff_path, band_index=23):
    """
    Extract geocoordinates of active fire pixels from a specific band in a GeoTIFF.

    Parameters
    ----------
    tiff_path : str
        Path to the GeoTIFF file.
    band_index : int
        Band number to extract (default = 23 for active fire).

    Returns
    -------
    list of tuple
        List of (longitude, latitude) coordinates where fire is detected.
    """
    with rasterio.open(tiff_path) as src:
        # Read the fire band
        fire_band = src.read(band_index)

        # Find all non-zero pixels (fire detections)
        rows, cols = np.where(fire_band > 0)

        # Convert pixel positions to geographic coordinates
        coords = [xy(src.transform, r, c) for r, c in zip(rows, cols)]

    return coords


# Example usage with one file
coords = extract_fire_coords("./2021-09-04.tif")
print(f"Extracted {len(coords)} fire pixels")
print("First 10 coordinates:", coords[:10])

# If you want to process all your uploaded files:
tiff_files = [
    "./2021-09-04.tif",
    "./2021-09-05.tif",
    "./2021-09-06.tif",
    "./2021-09-07.tif",
    "./2021-09-08.tif",
]

all_fire_coords = {}
for f in tiff_files:
    all_fire_coords[f] = extract_fire_coords(f)

# Example: number of detections per file
for f, coords in all_fire_coords.items():
    print(f"{f}: {len(coords)} fire detections")

