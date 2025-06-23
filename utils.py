import os
from cadquery import exporters, Shape
from typing import Union, Iterable
import trimesh


def exportModel(model: Union[Shape, Iterable[Shape]]):
    rootDir = os.path.dirname(__file__)
    stlPath = os.path.join(rootDir, "model.stl")
    glbPath = os.path.join(rootDir, "model-app", "public", "model.glb")

    # Удаление предыдущих файлов (если есть)
    for path in [stlPath, glbPath]:
        try:
            os.unlink(path)
        except FileNotFoundError:
            pass

    # Экспорт в STL
    exporters.export(model, stlPath, exportType="STL")

    # Экспорт в glb
    mesh = trimesh.load(stlPath)
    mesh.export(glbPath)