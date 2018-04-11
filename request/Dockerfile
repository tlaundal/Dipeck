FROM python:3

RUN groupadd uwsgi && useradd -g uwsgi uwsgi

RUN pip install --no-cache-dir uwsgi

WORKDIR /usr/src/app
# First copy and install requirements, for better caching
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN pip install --no-cache-dir .

# ENV FLASK_APP app
EXPOSE 5000

CMD ["uwsgi", "uwsgi.ini"]
