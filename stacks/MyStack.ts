import { StackContext, Api, EventBus, Bucket } from "sst/constructs";

export function API({ stack }: StackContext) {
  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 10,
    },
  });
  const bucket = new Bucket(stack, "sst-test-miguel2");

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        environment: {
          BUCKET_NAME: bucket.bucketName
        },
        bind: [bus, bucket],
        
      },
    },
    routes: {
      "POST /": "packages/functions/src/lambda.handler",
    },
  });

  bus.subscribe("todo.created", {
    handler: "packages/functions/src/events/todo-created.handler",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });


}
