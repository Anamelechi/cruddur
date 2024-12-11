# Week 2 — Distributed Tracing

## X-Ray

### Instrument AWS X-Ray for Flask
Run code on CLI

```bash

export AWS_REGION="us-east-1"
gp env AWS_REGION="us-east-1"

```

Add to the ```requirements.txt```

```bash

aws-xray-sdk

```

Install pythonpendencies

```bash

pip install -r requirements.txt

```

Add to ```app.py```

```python

from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.ext.flask.middleware import XRayMiddleware

xray_url = os.getenv("AWS_XRAY_URL")
xray_recorder.configure(service='Cruddur', dynamic_naming=xray_url)
XRayMiddleware(app, xray_recorder)

```

### Setup AWS X-Ray Resources

Add ```aws/json/xray.json```

```json

{
  "SamplingRule": {
      "RuleName": "Cruddur",
      "ResourceARN": "*",
      "Priority": 9000,
      "FixedRate": 0.1,
      "ReservoirSize": 5,
      "ServiceName": "Cruddur",
      "ServiceType": "*",
      "Host": "*",
      "HTTPMethod": "*",
      "URLPath": "*",
      "Version": 1
  }
}

```

Add to ```Docker-compose.yml```

```yaml

      AWS_XRAY_URL: "*4567-${GITPOD_WORKSPACE_ID}.${GITPOD_WORKSPACE_CLUSTER_HOST}*"
      AWS_XRAY_DAEMON_ADDRESS: "xray-daemon:2000"

```
Run

```bash
aws xray create-group \
   --group-name "Cruddur" \
   --filter-expression "service(\"$FLASK_ADDRESS\") {fault OR error}"

```

Run

```bash

aws xray create-sampling-rule --cli-input-json file://aws/json/xray.json

```
Install Xray Daemon

```bash

 wget https://s3.us-east-2.amazonaws.com/aws-xray-assets.us-east-2/xray-daemon/aws-xray-daemon-3.x.deb
 sudo dpkg -i **.deb

```

### Add Deamon Service to Docker Compose

```yml

  xray-daemon:
    image: "amazon/aws-xray-daemon"
    environment:
      AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}"
      AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}"
      AWS_REGION: "us-east-1"
    command:
      - "xray -o -b xray-daemon:2000"
    ports:
      - 2000:2000/udp

```

### Check service data for last 10 minutes

```bash

EPOCH=$(date +%s)
aws xray get-service-graph --start-time $(($EPOCH-600)) --end-time $EPOCH

```

## HoneyComb

When creating a new dataset in Honeycomb it will provide all these installation insturctions

Add the following files to our requirements.txt

```python

opentelemetry-api 
opentelemetry-sdk 
opentelemetry-exporter-otlp-proto-http 
opentelemetry-instrumentation-flask 
opentelemetry-instrumentation-requests

```

Install these dependencies:

```bash

pip install -r requirements.txt

```

Add to the ```app.py```

```python

from opentelemetry import trace
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

```
```python

# Initialize tracing and an exporter that can send data to Honeycomb
provider = TracerProvider()
processor = BatchSpanProcessor(OTLPSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

```
```python

# Initialize automatic instrumentation with Flask
app = Flask(__name__)
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()

```
Add the following Env Vars to backend-flask in docker compose


```yaml

OTEL_EXPORTER_OTLP_ENDPOINT: "https://api.honeycomb.io"
OTEL_EXPORTER_OTLP_HEADERS: "x-honeycomb-team=${HONEYCOMB_API_KEY}"
OTEL_SERVICE_NAME: "${HONEYCOMB_SERVICE_NAME}"

```
Set Env Vars
```
export HONEYCOMB_API_KEY=""
export HONEYCOMB_SERVICE_NAME="backend-flask"
gp env HONEYCOMB_API_KEY=""
gp env HONEYCOMB_SERVICE_NAME="backend-flask"

```

## CloudWatch Logs


Add to the ```requirements.txt```

```python

watchtower

```
Run

```bash

pip install -r requirements.txt

```
Add to ```app.py```

```python

import watchtower
import logging
from time import strftime

```
```python

# Configuring Logger to Use CloudWatch
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)
console_handler = logging.StreamHandler()
cw_handler = watchtower.CloudWatchLogHandler(log_group='cruddur')
LOGGER.addHandler(console_handler)
LOGGER.addHandler(cw_handler)
LOGGER.info("some message")

```python

@app.after_request
def after_request(response):
    timestamp = strftime('[%Y-%b-%d %H:%M]')
    LOGGER.error('%s %s %s %s %s %s', timestamp, request.remote_addr, request.method, request.scheme, request.full_path, response.status)
    return response

```
Log something in an API endpoint

```python

LOGGER.info('Hello Cloudwatch! from  /api/activities/home')

```

Set the env var in your backend-flask for ```docker-compose.yml```

```yaml

      AWS_DEFAULT_REGION: "${AWS_DEFAULT_REGION}"
      AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}"
      AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}"

```

Rollbar kept failing to integrate with my app to i decided to use Sentry

## Sentry
### For backend error logging and tracing

https://sentry.io/

Create a new project in Sentry called Backend-flask

Add to ```requirements.txt```

```python

sentry-sdk[flask]

```

Run

```python

pip install -r requirements.txt

```
Import for Sentry

```python

import sentry_sdk
from flask import Flask

```
```python

sentry_sdk.init(
    dsn="https://db0e40dcaf18087a90c5d5fc20551c54@o4508444987097088.ingest.de.sentry.io/4508445037428816",
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for tracing.
    traces_sample_rate=1.0,
    # Set profiles_sample_rate to 1.0 to profile 100%
    # of sampled transactions.
    # We recommend adjusting this value in production.
    profiles_sample_rate=1.0,
)


```

Verify

```python

@app.route("/")
def hello_world():
    1 / 0  # raises an error
    return "<p>Hello, World!</p>"

````

### For Frontend error logging and tracing

### Install
Add the Sentry SDK as a dependency using npm

```bash

npm install @sentry/react --save

```

### Configure SDK

```javascript

import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://1ccca6ac5bd168a3393f66875757f003@o4508444987097088.ingest.de.sentry.io/4508446553735248",
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const container = document.getElementById(“app”);
const root = createRoot(container);
root.render(<App />);

```
### Upload Source Maps

Automatically upload your source maps to enable readable stack traces for Errors.

```bash

npx @sentry/wizard@latest -i sourcemaps --saas

```

























