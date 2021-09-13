from json import load

with open('data.json', 'r') as f:
    data = load(f)

link_list = [value for elem in data[0]['links'] for value in elem.values()]

for d in data[0]['nodes']:
    if d['name'] not in link_list:
        print(d['name'])