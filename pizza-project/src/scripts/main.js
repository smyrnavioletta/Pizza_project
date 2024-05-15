
function createProduct(name, urlImg, price, id, category) {
    return { name, urlImg, price, id, category };
}

function createDataBase() {
    const data = [];

    function loadData(url, category) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(items => {
                items.forEach(item => {
                    data.push(createProduct(item.name, item.urlImg, item.price, item.id, category));
                });
                return data;
            })
            .catch(error => {
                console.error('Error loading data:', error);
            });
    }

    return {
        init: function() {
            return Promise.all([
                loadData('./data/db-pizzas.json', 'pizzas'),
                loadData('./data/db-drinks.json', 'drinks')
            ]);
        },
        getProduct: function(category) {
            return data.filter(product => product.category === category);
        },
        getProductById: function(id) {
            return data.find(product => product.id === id);
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const db = createDataBase();
    const productView = createProductView(db);
    const basket = createBasket();

    db.init().then(() => {
        productView.setupEventListeners('button[data-category]', '.container-products');
        basket.render('.basket');
    }).catch(error => {
        console.error('Error initializing database:', error);
    });
});

function createBasket() {
    let products = JSON.parse(localStorage.getItem('basket') || '[]');

    function save() {
        localStorage.setItem('basket', JSON.stringify(products));
    }

    function add(product) {
        const foundProduct = products.find(p => p.id === product.id);
        if (foundProduct) {
            foundProduct.count++;
        } else {
            products.push({ ...product, count: 1, totalPrice: product.price });
        }
        save();
    }

    function updateCount(id, increment) {
        const product = products.find(p => p.id === id);
        if (product) {
            product.count += increment ? 1 : -1;
            if (product.count <= 0) {
                products = products.filter(p => p.id !== id);
            } else {
                product.totalPrice = product.count * product.price;
            }
            save();
        }
    }

    function render(containerSelector) {
        const container = document.querySelector(containerSelector);
        container.innerHTML = '';
        products.forEach(product => {
            container.innerHTML += `
                <div>
                    <h4>${product.name}</h4>
                    <p>Цена: ${product.price}</p>
                    <p>Количество: ${product.count}</p>
                    <button onclick="basket.updateCount(${product.id}, true)">+</button>
                    <button onclick="basket.updateCount(${product.id}, false)">-</button>
                    <p>Всего: ${product.totalPrice}</p>
                </div>
            `;
        });
    }

    return { add, updateCount, render, save };
}

const db = createDataBase();
const productView = createProductView(db);
const basket = createBasket();

document.addEventListener('DOMContentLoaded', () => {
    productView.setupEventListeners('button[data-category]', '.container-products');
    basket.render('.basket');
});

