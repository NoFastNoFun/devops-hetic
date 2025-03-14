#!/bin/bash

NAMESPACE=
FILE=$1
echo "Reading file $FILE"

EMAIL=$2
echo "Send email ? $EMAIL (to activate, use 'email=true')"

if [ -z $FILE ] || [ ! -f $FILE ]; then 
  echo "File $FILE does not exist"
  exit 1
fi

if [ "$EMAIL" = "email=true" ]; then
  
  if [ ! $MJ_APIKEY_PUBLIC ]; then
    echo "Precisez bien 'export MJ_APIKEY_PUBLIC=...'"
    exit 1
  fi

  if [ ! $MJ_APIKEY_PRIVATE ]; then
    echo "Precisez bien 'export MJ_APIKEY_PRIVATE=...'"
    exit 1
  fi
fi

sed '/^$/d' $FILE

mkdir -p ./tmp

lines=$(cat $FILE)
for line in $lines
do
  emailraw=$(echo $line | xargs | tr [:upper:] [:lower:])
  email=$(echo $line | xargs | tr [:upper:] [:lower:] | sed -e 's/@/-/g' | sed -e 's/\./-/g' | sed -e 's/\_/-/g')
  echo "Namespace: $email"

  NAMESPACE=$email
  cat ./role.model.k8s.yaml | sed -e "s/STUDENT/$NAMESPACE/g" > ./tmp/student.tmp.k8s.yaml

  kubectl create namespace $NAMESPACE
  kubectl apply -f ./tmp/student.tmp.k8s.yaml

  TOKEN=$(kubectl create token $NAMESPACE-sa -n $NAMESPACE --duration 8760h)

  cat ./kubeconfig.model.student.yaml | sed -e "s/STUDENT/$NAMESPACE/g" | sed -e "s/TOKEN/$TOKEN/g" > ./tmp/kubeconfig-$NAMESPACE.yaml
  
  if [ "$EMAIL" = "email=true" ]; then
    mkdir -p ./tmp/emails
    if [ ! -f ./tmp/emails/$email ]; then 
      kubeconf=$(cat ./tmp/kubeconfig-$NAMESPACE.yaml | base64 -w 0)
      message="{
        \"Messages\":[
            {
                \"From\": {
                    \"Email\": \"kevin@glassworks.tech\",
                    \"Name\": \"Kevin Glass\"
                },
                \"To\": [
                    {
                        \"Email\": \"$emailraw\",
                        \"Name\": \"$emailraw\"
                    }
                ],
                \"Subject\": \"Votre kubeconfig\",
                \"TextPart\": \"Merci de trouver ci-joint votre kubeconfig.yaml pour connecter au cluster kubernetes. \n\nMerci d'utiliser le chemin '$NAMESPACE' dans votre controlleur ingress.\n\nBien cordialement,\nKevin Glass\n\n\",
                \"Attachments\": [
                    {
                        \"ContentType\": \"text/plain\",
                        \"Filename\": \"kubeconfig.yaml\",
                        \"Base64Content\": \"$kubeconf\"
                    }
                ]
            }
        ]
      }"

      curl -s \
      -X POST \
      --user "$MJ_APIKEY_PUBLIC:$MJ_APIKEY_PRIVATE" \
      https://api.mailjet.com/v3.1/send \
      -H 'Content-Type: application/json' \
      -d "$message"

      touch ./tmp/emails/$email
    fi
  fi

done

#kubectl create namespace $NAMESPACE

#kubectl apply -f ./role.k8s.yaml
#kubectl apply -f ./role-binding.k8s.yaml
#kubectl apply -f ./sa.k8s.yaml
#kubectl apply -f ./secret.k8s.yaml


#SECRET_NAME=$(kubectl get serviceaccount kevin-nguni-fr-sa -n kevin-nguni-fr -o jsonpath='{$.secrets[0].name}')
#TOKEN=$(kubectl get secret ${SECRET_NAME} -n kevin-nguni-fr  -o jsonpath='{$.data.token}' | base64 -d | sed $'s/$/\\\n/g')
#echo $TOKEN

#kubectl create token kevin-nguni-fr-sa -n kevin-nguni-fr