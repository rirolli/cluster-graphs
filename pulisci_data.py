from json import load, dump

with open('data.json', 'r') as f:
    data = load(f)

print(len(data))

for i in range(len(data)):

    link_list = [value for elem in data[i]['links'] for value in elem.values()]
    nodes_not_linked = []

    for d in data[i]['nodes']:
        if d['name'] not in link_list:
            nodes_not_linked.append(d['name'])

    print(nodes_not_linked)


    data[i] = [d for d in data[i]['nodes'] if d['name'] not in nodes_not_linked]

    with open('data2.json', 'w') as f:
        dump(data, f)