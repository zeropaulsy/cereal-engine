// Dev
Mousetrap.bind('r',   () => { location.reload(); }, 'keydown' );
Mousetrap.bind('q',   () => {
	Game.setState(new SnoopSlayer());
}, 'keydown' );
