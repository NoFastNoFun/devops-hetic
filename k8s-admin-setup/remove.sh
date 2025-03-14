#!/bin/bash

FILE=$1
echo "Reading file $FILE"

if [ -z $FILE ] || [ ! -f $FILE ]; then 
  echo "File $FILE does not exist"
  exit 1
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

  kubectl delete namespace $NAMESPACE
done

