/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

class Id 
{
	constructor()
	{
		this.id = 0;
	}

	next()
	{
		this.id += 1;
		return "Id" + this.id;
	}
}

var id = new Id();

function displayInline(id, value)
{
	return '<div id="id" class="inline">' + value + '</div>';
}

function displayBlock(id, value)
{
	return '<div id="id" class="block">' + value + '</div>';
}

function displayFilter(id, filter, value)
{
	displayInline(id + "filter", filter);
	displayInline(id, value);
}

class Definition
{
	constructor(name)
	{
		this.name = name;
		this.next = null;
	}

	display(id)
	{
		return displayInline(id, "⦾ " + name);
	}
}

class Base extends Definition
{
	constructor(name)
	{
		super(name)
		this.child = null;
	}
}

class Plain extends Base
{
	constructor()
	{
		super("Plain");
	}
}

class List extends Base
{
	constructor(separator)
	{
		super("List");

		this.separator = separator;
	}
}

class Or extends Base
{
	constructor()
	{
		super("Or");
	}
}

class Leaf extends Definition
{
	constructor(name, value, left, right)
	{
		super(name);
		this.value = value;
		this.left = left;
		this.right = right;
	}

	display(id)
	{
		return displayInline(id, this.left + this.value + this.right);
	}
}

class Terminal extends Leaf
{
	constructor(value)
	{
		super("Terminator", value, "", " ");
	}
}

class String extends Leaf
{
	constructor(value)
	{
		super("String", value, '"', '"');
	}
}

class Filter extends Leaf
{
	constructor(name, filter, value, left, right)
	{
		super(name, value, left, right);
		this.filter = filter;
	}

	display(id)
	{
		return "⦿";
	}
}

class Symbol extends Filter
{
	constructor(filter, value)
	{
		super("Symbol", filter, value, "<", ">");
	}
}

class Literal extends Filter
{
	constructor(filter, value)
	{
		super("Literal", filter, value, "{", "}")
	}
}


class Instance
{
	constructor(definition)
	{
		this.definition = definition;
		this.parent = null;
		this.previous = null;
		this.next = null;
		this.value = null;
		this.id = id.next();
	}

	display()
	{
		let result = "";

		if (null == this.value)
		{
			result = this.definition.display(this.id);
		}
		else
		{
			displayInline(this.id, this.value)
		}

		if (!(null == this.next))
		{
			result += this.next.display();
		}

		return result;
	}
}

class Branch extends Instance
{
	constructor(definition)
	{
		super(definition);
		this.child = null;
	}

	append(list, instance)
	{
		if (null == list.next)
		{
			list.next = instance;
			instance.previous = list;
		}
		else
		{
			append(list.next, instance); 
		}
	}

	add(instance)
	{
		if (null == this.child)
		{
			this.child = instance;
			instance.parent = this;
		}
		else
		{
			this.append(this.child, instance);
		}
	}

	display()
	{
		if (this.child == null)
		{
			return this.definition.display(id, this.child);
		}
		else
		{
			return this.child.display();
		}
	}
}

function makeTerminal(string) 
{
	const terminal = new Terminal(string);
	return new Instance(terminal);
}

function makeString(string) 
{
	const definition = new String(string);
	return new Instance(definition);
}

function makeSymbol(filter, string) 
{
	const symbol = new Symbol(filter, string);
	return new Instance(symbol);
}

function makeLiteral(filter, string) 
{
	const literal = new Literal(string);
	return new Instance(literal);
}




function makePlain() 
{
	const plain = new Plain();
	return new Branch(plain);
}



function tree()
{
	const root = makePlain();

	root.add(makeString("A string"));
	root.add(makeSymbol("[a-z]*", "Symbol"));

	const result = root.display();
	return result;
}

function load() 
{
	const contents = document.getElementById("contents");
	contents.innerHTML = tree();
}

const button = document.getElementById("loadButton");
button.addEventListener("click", load)

