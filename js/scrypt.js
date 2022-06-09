"use strict"
/*--------
//Object
const person = {
    name: 'Nikita',
    age: 22,
    job: 'Frontend'
}

const op = new Proxy(person, {
    get(target, prop) {
        console.log(`Getting prop ${prop}`)
        if (!(prop in target)) {
            return prop.split('_').map(p => target[p]).join(' ')
        }
        return target[prop]
    },
    set(target, prop, value) {
        if (prop in target) {
            target[prop] = value
        } else {
            throw new Error(`No ${prop} field in target`)
        }
    },
    has(target, prop) {
        return [`age`, `name`, `job`].includes(prop)
    },
    deleteProperty(target, prop) {
        console.log(`Deleting...`, prop)
        delete target[prop]
        return true
    }
})

// Functions
const log = text => `Log: ${text}`

const fp = new Proxy(log, {
    apply(target, thisArg, args) {
        console.log('Calling fn...')

        return target.apply(thisArg, args).toUpperCase()
    }
})


// Classes

class Person {
    constructor(name, age) {
        this.name = name
        this.age = age
    }
}

const PersonProxy = new Proxy(Person, {
    construct(target, args) {
        console.log(`Construct...`)

        return new Proxy(new target(...args), {
            get(t, prop) {
                console.log(`Gettin prop ${prop}`)
                return t[prop]
            }
        })
    }
})

const p = new PersonProxy('Alexey', 33)

----------*/

//Wrapper

const withDefaultValue = (traget, defaultValue = 0) => {
    return new Proxy(traget, {
        get: (obj, prop) => (prop in obj) ? obj[prop] : defaultValue
    })
}

const position = withDefaultValue({
    x: 24,
    y: 42
}, 0)

console.log(position)

// Hidden properies
const withHiddenProps = (target, prefix = '_') => {
    return new Proxy(target, {
        has: (obj, prop) => (prop in obj) && (!prop.startsWith(prefix)),
        ownKeys: obj => Reflect.ownKeys(obj)
            .filter(p => !p.startsWith(prefix)),
        get: (obj, prop, receiver) => (prop in receiver)
            ? obj[prop]
            : void 0
    })
}

const data = withHiddenProps({
    name: 'Lev',
    age: 55,
    _uid: '55667788'
})



// const index = {}
// userData.forEach(i => (index[i.id] = i))


const IndexArray = new Proxy(Array, {
    construct(target, [args]) {
        const index = {}
        args.forEach(item => (index[item.id] = item))

        return new Proxy(new target(...args), {
            get(arr, prop) {
                switch (prop) {
                    case 'push':
                        return item => {
                            index[item.id] = item
                            arr[prop].call(arr, item)
                        }
                    case 'findById':
                        return id => index[id]
                    default:
                        return arr[prop]
                }
            }
        })
    }
})

const users = new IndexArray([
    { id: 1, name: 'Nikita', job: 'Frontend', age: 22 },
    { id: 2, name: 'Alex', job: 'Poker', age: 24 },
    { id: 3, name: 'Vova', job: 'Business', age: 12 },
    { id: 4, name: 'Vlad', job: 'Auto', age: 29 }
])