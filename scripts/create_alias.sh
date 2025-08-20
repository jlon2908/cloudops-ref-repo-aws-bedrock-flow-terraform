
if [ -z "$AWS_ROLE_ARN" ]; then
    VERSION_COMMAND=$(echo "aws bedrock-agent create-flow-version --flow-identifier '$FLOWID' --description '$FLOWVERDESC' --profile $PROFILE > output.txt")
    eval "$VERSION_COMMAND"
    STR=$(grep "\"version\": \"" output.txt | cut -d '"' -f 4)
    VERSION=$(echo \'[{\"flowVersion\":\"$STR\"}]\')
    COMMAND_ALIAS=$(echo "aws bedrock-agent create-flow-alias --flow-identifier $FLOWID --name '$ALIASNAME' --description '$ALIASSDESC' --routing-configuration $VERSION --profile $PROFILE")
    eval "$COMMAND_ALIAS"
else
    echo "aws_role is set to '$AWS_ROLE_ARN'"
    set -e
    CREDENTIALS=(`aws sts assume-role \
    --role-arn $AWS_ROLE_ARN \
    --role-session-name "bedrock-cli" \
    --query "[Credentials.AccessKeyId,Credentials.SecretAccessKey,Credentials.SessionToken]" \
    --output text`)

    unset AWS_PROFILE
    export AWS_DEFAULT_REGION=$AWS_REGION
    export AWS_ACCESS_KEY_ID="$${CREDENTIALS[0]}"
    export AWS_SECRET_ACCESS_KEY="$${CREDENTIALS[1]}"
    export AWS_SESSION_TOKEN="$${CREDENTIALS[2]}"

    VERSION_COMMAND=$(echo "aws bedrock-agent create-flow-version --flow-identifier '$FLOWID' --description '$FLOWVERDESC' > output.txt")
    eval "$VERSION_COMMAND"
    STR=$(grep "\"version\": \"" output.txt | cut -d '"' -f 4)
    VERSION=$(echo \'[{\"flowVersion\":\"$STR\"}]\')
    COMMAND_ALIAS=$(echo "aws bedrock-agent create-flow-alias --flow-identifier $FLOWID --name '$ALIASNAME' --description '$ALIASSDESC' --routing-configuration $VERSION")
    eval "$COMMAND_ALIAS"
fi