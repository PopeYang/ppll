---
title: Arch Linux
position: 10
description: Arch Linux 安装与图形环境配置
---

## 网络连接

首先联网, WIFI需要登陆, 需要浏览器操作, 安装图形环境

```
sudo pacman -S gnome gdm
```

第一次配置, 全部选择了默认, 也就是

```
sudo systemctl enable gdm
sudo systemctl start gdm
```
