terraform {
  required_providers {
    tencentcloud = {
      source  = "tencentcloudstack/tencentcloud"
      version = "1.81.13"
    }
  }
}

provider "tencentcloud" {
  secret_id  = var.secret_id
  secret_key = var.secret_key
  region     = var.region
}

variable "region" {
  default = "na-ashburn" # Região Virginia
}

variable "vpc_id" {}
variable "subnet_id" {}
variable "secret_id" {}
variable "secret_key" {}
variable "existing_sg_id" {
  description = "ID de um Security Group criado manualmente e com a tag Brasil:Resources=true"
}

# Regras de entrada e saída para o Security Group existente
resource "tencentcloud_security_group_rule" "ssh_ingress" {
  security_group_id = var.existing_sg_id
  type              = "ingress"
  ip_protocol       = "TCP"
  port_range        = "22"
  cidr_ip           = "0.0.0.0/0"
  policy            = "ACCEPT"
  description       = "Allow SSH"
}

resource "tencentcloud_security_group_rule" "http_ingress" {
  security_group_id = var.existing_sg_id
  type              = "ingress"
  ip_protocol       = "TCP"
  port_range        = "80"
  cidr_ip           = "0.0.0.0/0"
  policy            = "ACCEPT"
  description       = "Allow HTTP"
}

resource "tencentcloud_security_group_rule" "egress_tcp" {
  security_group_id = var.existing_sg_id
  type              = "egress"
  ip_protocol       = "TCP"
  port_range        = "1-65535"
  cidr_ip           = "0.0.0.0/0"
  policy            = "ACCEPT"
  description       = "Allow outbound TCP"
}

resource "tencentcloud_security_group_rule" "egress_udp" {
  security_group_id = var.existing_sg_id
  type              = "egress"
  ip_protocol       = "UDP"
  port_range        = "1-65535"
  cidr_ip           = "0.0.0.0/0"
  policy            = "ACCEPT"
  description       = "Allow outbound UDP"
}

resource "tencentcloud_security_group_rule" "egress_icmp" {
  security_group_id = var.existing_sg_id
  type              = "egress"
  ip_protocol       = "ICMP"
  port_range        = "1-65535"
  cidr_ip           = "0.0.0.0/0"
  policy            = "ACCEPT"
  description       = "Allow outbound ICMP"
}

# Instância CVM
resource "tencentcloud_instance" "teste_tf_instance" {
  instance_name              = "teste-tf-instance"
  availability_zone          = "na-ashburn-1"
  image_id                   = "img-pi0ii46r" # Exemplo: Windows Server 2022
  instance_type              = "S5.MEDIUM4"
  system_disk_type           = "CLOUD_SSD"
  system_disk_size           = 50
  vpc_id                     = var.vpc_id
  subnet_id                  = var.subnet_id
  orderly_security_groups    = [var.existing_sg_id]
  hostname                   = "teste-tf"
  internet_max_bandwidth_out = 100

  tags = {
    "Brasil:Resources" = "true"
  }
}





