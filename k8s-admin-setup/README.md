# Cluster setup details

This is a guide to setting up the K8S Cluster for the students.

Open this project inside a DevContainer, and navigate to this directory in the terminal.

# Setup Scaleway

Setup a cluster in the Scaleway console and call it "hetic-devops".

Create a public IP address:

```bash
export SCW_ACCESS_KEY=
export SCW_SECRET_KEY=
export SCW_DEFAULT_ORGANIZATION_ID=
export SCW_DEFAULT_PROJECT_ID=

curl -X POST "https://api.scaleway.com/lb/v1/regions/fr-par/ips" -H "X-Auth-Token: $SCW_SECRET_KEY" -H "Content-Type: application/json" \
-d "{\"project_id\":\"$SCW_DEFAULT_PROJECT_ID\"}"
```

Note down the public IP created.

Go to the DNS records, and make an A record: `cluster.mt.glassworks.tech` that points to this IP address.


Add an Ingress Application (nginx-ingress), with the following configuration:

```yaml
controller:
  hostPort:
    enabled: true
  ingressClassResource:
    default: true
    enabled: true
  kind: DaemonSet
  service:
    loadBalancerIP: 51.159.113.101
    externalTrafficPolicy: "Local"
    annotations:
      service.beta.kubernetes.io/scw-loadbalancer-proxy-protocol-v2: "true"
      service.beta.kubernetes.io/scw-loadbalancer-use-hostname: "true"
      service.beta.kubernetes.io/scw-loadbalancer-type: "lb-s"
  config:
    use-forwarded-headers: "true"
    compute-full-forwarded-for: "true"
    use-proxy-protocol: "true"
```

A LoadBalancer should be created under Network/Load Balancers

1. Download the kubeconfig from Scaleway, and rename it `kubeconfig.yaml`. Place it in this directory.
2. Create the file `kubeconfig.model.student.yaml`, with the following contents :

```yml
apiVersion: v1
clusters:
 - COPY THIS SECTION
contexts:
- name: STUDENT
  context:
    cluster: "hetic-devops"
    user: STUDENT
    namespace: STUDENT
current-context: STUDENT
kind: Config
preferences: {}
users:
- name: STUDENT
  user:
    token: TOKEN
```

3. Replace the `clusters` section with that copied from the kubeconfig from scaleway
4. If you useds a different cluster, name, replace "hetic-devops" with that name
5. Fill the `students.txt` file with the list of students (you can use any name you like for this file)
6. Run :

```sh
# Replace this with the name of your admin kubeconfig from scaleway
export KUBECONFIG=./kubeconfig.yaml

# Run the setup (without emails)
./setup.sh students.txt

# Run the setup (with emails)
./setup.sh students.txt email=true
```

You can test a student account with:

```sh
STUDENTCONFIG=./tmp/kubeconfig-kevin-nguni-fr.yaml 
kubectl get pods --kubeconfig $STUDENTCONFIG 
kubectl run nginx --image=nginx --restart=Never --kubeconfig $STUDENTCONFIG
kubectl get pods --kubeconfig $STUDENTCONFIG
kubectl delete pod nginx  --kubeconfig $STUDENTCONFIG

STUDENTCONFIG=./tmp/kubeconfig-s-aouizerate-hetic-eu.yaml
# etc
```