---
title: 迁移 GitLab 数据
description: 迁移 Docker 存储目录的记录
---

# 迁移 GitLab 数据

## 前言

部署好了 GitLab, 一路回车, 今天`df -h`发现盘快满了, 所以迁移一下数据.

## 迁移流程

### 查看存储情况

```
fem@fem:~$ lsblk -f
NAME        FSTYPE      FSVER    LABEL UUID                                   FSAVAIL FSUSE% MOUNTPOINTS
loop0       squashfs    4.0                                                         0   100% /snap/snapd/25577
loop1                                                                               0   100% /snap/core24/1225
loop2                                                                               0   100% /snap/slcli/2957
sda
├─sda1
└─sda2      ext4        1.0            00f190eb-b6da-4c8b-9b1b-2479c452b5bb      7.1G    88% /
sdb         LVM2_member LVM2 001       imrr0O-OmrH-nZoj-hSsS-lVyq-vUpq-7xVJos
└─vg0-lv--0 ext4        1.0            caa511ed-2f32-418a-9c9b-ef870d966cc8    454.1G     2% /data
fem@fem:~$ df -h
Filesystem             Size  Used Avail Use% Mounted on
tmpfs                  1.6G  1.3M  1.6G   1% /run
/dev/sda2               98G   86G  7.2G  93% /
tmpfs                  7.9G     0  7.9G   0% /dev/shm
tmpfs                  5.0M     0  5.0M   0% /run/lock
/dev/mapper/vg0-lv--0  492G   12G  455G   3% /data
tmpfs                  1.6G   12K  1.6G   1% /run/user/1000
```

### 停止 Docker

Docker 由 dockerd + containerd 组成

```
sudo systemctl stop docker
sudo systemctl stop docker.socket
sudo systemctl stop containerd
``` 

然后 `systemctl status docker` + `systemctl status containerd` 确认进程都停掉了

### 新建目录

在 /data 盘新建 docker 目录

```
sudo mkdir -p /data/docker
sudo chmod 711 /data/docker
```

### rsync 迁移

```
sudo rsync -aHAXx --numeric-ids --info=progress2 /var/lib/docker/ /data/docker/
```

Claude和GPT互相完善给出的参数, 看着就很完善

| 参数             | 作用                        |
| ---------------- | --------------------------- |
| -a               | 保留权限                    |
| -H               | 保留硬链接（overlay2 必须） |
| -A               | ACL                         |
| -X               | extended attributes         |
| -x               | 不跨文件系统                |
| --numeric-ids    | 保留 UID/GID                |
| --info=progress2 | 更清晰进度                  |

等进度条走完


