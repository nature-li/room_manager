import pandas


table = {
    'name': ['lyg', 'xb', 'lst'],
    'age': [23, 30, 24]
}
pandas.set_option('display.max_colwidth', -1)
pf = pandas.DataFrame(table)
pf = pf[['name', 'age']]
print pf.to_html(index=False, escape=False)
