---
title: GitLab 部署记录
weight: 30
description: 在 Ubuntu 24.04 上使用 Docker 部署 GitLab CE 的步骤记录
---

## 环境准备

使用 `cat /etc/os-release` 可以查看系统信息, 确认系统为 "Ubuntu 24.04.3 LTS".

然后 `df -h` 和 `lsblk` 查看网管给我分配的硬盘资源, 熟悉的指令, 安装arch的时候使用过这俩.

```yml
fem@fem:~$ df -h
Filesystem             Size  Used Avail Use% Mounted on
tmpfs                  1.6G  1.3M  1.6G   1% /run
/dev/sda2               98G  6.8G   87G   8% /
tmpfs                  7.9G     0  7.9G   0% /dev/shm
tmpfs                  5.0M     0  5.0M   0% /run/lock
/dev/mapper/vg0-lv--0  492G   44K  467G   1% /data
tmpfs                  1.6G   12K  1.6G   1% /run/user/1000
fem@fem:~$ lsblk
NAME        MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
loop0         7:0    0 50.9M  1 loop /snap/snapd/25577
loop1         7:1    0 66.8M  1 loop /snap/core24/1225
loop2         7:2    0 13.9M  1 loop /snap/slcli/2957
sda           8:0    0  100G  0 disk
├─sda1        8:1    0    1M  0 part
└─sda2        8:2    0  100G  0 part /
sdb           8:16   0  500G  0 disk
└─vg0-lv--0 252:0    0  500G  0 lvm  /data
```

> 磁盘设备文件是以 /dev/sdX 的形式出现的

## 安装 Docker 和 Docker Compose

`sudo apt install -y docker.io docker-compose` 安装 Docker 和 Docker Compose.

然后 `docker --version` 和 `docker-compose --version` 查看版本确认安装成功.

```bash
fem@fem:~$ docker --version
docker-compose --version
Docker version 28.2.2, build 28.2.2-0ubuntu1~24.04.1
docker-compose version 1.29.2, build unknown
```

给当前用户 `$USER` 加 Docker 权限 `sudo usermod -aG docker $USER` , ssh重连, 可以避免每次都输入密码.

然后被告知服务器网络连接各种受限, 只能本地拉取镜像, 然后上传到服务器. 本地Windows上 `docker pull gitlab/gitlab-ce:latest` , 等待拉取完成之后, `docker images | grep gitlab` 查看镜像ID, 然后 `docker save gitlab/gitlab-ce:latest -o gitlab-ce-latest.tar` 保存为tar文件, 通过堡垒机的SFTP上传到服务器的data路径下, `cd data` -> `ls -lh gitlab-ce-latest.tar` 确认文件在这, 然后 `docker load -i gitlab-ce-latest.tar` 加载镜像,之后 `cd ~/gitlab-docker` 和 `docker-compose up -d` 启动容器.

## 配置证书

网管丢给我一个zip, 自己部署, 核心就是跟着GPT说的一步步来

```bash
mkdir -p /data/gitlab/ssl
cd /data
unzip nginx.zip -d /data/gitlab/ssl
```

~~这里受限只能通过堡垒机上传, 结果手动在home下面新键的data目录, 导致半天找不到文件, 被自己狠狠蠢到~~

执行

```bash
sudo chmod 700 /data/gitlab/ssl
sudo chmod 600 /data/gitlab/ssl/*.key
```

说是因为GitLab 要求 SSL 目录权限为 700，私钥权限必须 600，否则 GitLab Nginx 不会加载.

之后比较麻烦的就是要修改rb文件里面的配置, 学会了nano编辑器的退出,  `Ctrl+O, Enter, Ctrl+X` , 之前都是vim的 `Esc + :wq`

至此GitLab在局域网内可以访问了☕

![GitLab登陆成功](images/gitlab.png)

## 启用 GitLab Pages

GitLab Pages 需要额外配置。首先，确保在 `gitlab.rb` 文件中启用了 Pages 服务：

```ruby
# GitLab Pages

# 1. 设置 Pages 的外部域名 (即使在内部不配置 SSL，这里也要写 https，为了生成的链接正确)
pages_external_url "https://pages.xxx.com.cn"

# 2. 启用 Pages 核心服务
gitlab_pages['enable'] = true

# 3. 【关键】禁用 Pages 自带的 Nginx (避免冲突)
pages_nginx['enable'] = false

# 4. 【关键】让 Pages 服务直接监听所有网卡的 8090 端口
# 这样你才能从宿主机通过 docker 端口映射访问到它
gitlab_pages['listen_proxy'] = "0.0.0.0:8090"

# 5. 告诉 Pages 不要自己在内部搞 SSL (因为外部 Nginx 会处理)
gitlab_pages['inplace_chroot'] = true
```

## 配置 GitLab Runner

GitLab的CI/CD依赖runner来执行任务, 计划在一台Windows机器上部署runner, 我的Pages使用Docusaurus, 准备对应的node环境.

在Windows上使用PowerShell安装环境:

```powershell
winget install OpenJS.NodeJS.LTS
```

通过`node -v` 和 `npm -v` 查看版本确认安装成功.

```bash
C:\Users\ppll>node -v
v24.11.1

C:\Users\>npm -v
11.6.2
```

然后开始安装GitLab Runner, PowerShell 管理员权限执行:

```powershell
Invoke-WebRequest -Uri https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-windows-amd64.exe -OutFile gitlab-runner.exe
```

安装

```powershell
.\gitlab-runner.exe install
```

启动

```powershell
.\gitlab-runner.exe start
```

查看状态

```powershell
PS C:\Windows\system32> Invoke-WebRequest -Uri https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-windows-amd64.exe -OutFile gitlab-runner.exe
PS C:\Windows\system32> .\gitlab-runner.exe install
Runtime platform                                    arch=amd64 os=windows pid=43444 revision=df85dadf version=18.6.6
PS C:\Windows\system32> .\gitlab-runner.exe start
Runtime platform                                    arch=amd64 os=windows pid=33268 revision=df85dadf version=18.6.6
PS C:\Windows\system32> Get-Service gitlab-runner

Status   Name               DisplayName
------   ----               -----------
Running  gitlab-runner      gitlab-runner
```

然后进入GitLab的网页端, 新建Group, 新建Project, 进入项目右上角的

> Project Settings -> CI/CD -> Runners -> Create project runner

复制注册命令, 在PowerShell中执行注册命令, 命名, 操作选择Shell, 完成注册.
