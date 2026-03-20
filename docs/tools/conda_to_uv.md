---
title: Conda 迁移到 uv
description: 记录将 Python 开发环境从 Conda 迁移到 uv 的过程和经验
---

# 从 Conda 迁移到 uv

这篇文档记录了将 Python 虚拟环境和包管理从 Conda 迁移到 [uv](https://github.com/astral-sh/uv) 的过程。

## 为什么选择 uv？


- ~~**极速**：由 Rust 编写，解析和安装依赖的速度远超传统的 pip 和 conda。~~
- ~~**兼容性**：完全兼容 pip、 `requirements.txt` 和 `pyproject.toml` 生态。~~
- ~~**一体化**：支持 Python 版本管理、虚拟环境管理、甚至项目管理，几乎可以实现 all-in-one。~~

- 群友说这个好用
- 刷推看到codex要收购uv

## 迁移步骤

### 1. 安装 uv

使用官方推荐的安装脚本来安装 `uv`: 

**Windows:** `Win+R`, 粘贴执行
```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```


