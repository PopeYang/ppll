---
title: FreeCAD 构建
weight: 20
description: FreeCAD 构建步骤记录
---

## 构建环境

在Windows上编译FreeCAD, 安装:
- Visual Studio 2022 Community
  - 勾选：
    - [x] Desktop development with C++
    - [x] C++ CMake tools for Windows
- CMake（勾选“Add to PATH”省事）
  - 选择3.31.10 (3.x即可)
  - 4.0 之后的版本太新了会报错
    ```
    CMake Error at .../Coin-4.0.2/coin-config.cmake:1 (cmake_minimum_required):
    Compatibility with CMake < 3.5 has been removed from CMake.
    ```
- 7-Zip

## 下载源码

基于 release 1.0.2 版本进行二次开发

```bash
cd D:\Gitee
git clone https://github.com/FreeCAD/FreeCAD.git
git checkout  tags/1.0.2
```

## 下载并解压 LibPack

对应编译的1.0.2版本, 到 FreeCAD-LibPack 的 Releases 下载 LibPack-1.0.0 Version 3.0.0

解压到 D:\Gitee\LibPack-1.0.0-v3.0.0-Release

### 子模块submodule

```bash
cd D:\Gitee\FreeCAD
git submodule update --init --recursive
```

### 编译输出目录

采用 out-of-source build

文件结构：
```bash
D:\Gitee\
├─ FreeCAD\
├─ FreeCAD-build\
├─ LibPack-1.0.0-v3.0.0-Release\
```
新建文件夹 FreeCAD-build
```bash
mkdir D:\Gitee\FreeCAD-build
```

### CMake 配置

使用GUI操作,打开 CMake, 设置

- Where is the source code: → D:/Gitee/FreeCAD
- Where to build the binaries: → D:/Gitee/FreeCAD-build

点击 Configure, 选择
- Generator: → Visual Studio 17 2022
- Platform: → x64

Configure, 报错之后，找到并设置 LibPack 路径
- FREECAD_LIBPACK_DIR → D:/Gitee/LibPack-1.0.0-v3.0.0-Release

然后重新 Configure

![alt text](images/cmake_build.png)

提示

```
=================================================
Now run 'cmake --build D:/Gitee/FreeCAD-build' to build FreeCAD
=================================================
```

直接Generate, `Generating done (12.2s)`, 完成cmake配置.

