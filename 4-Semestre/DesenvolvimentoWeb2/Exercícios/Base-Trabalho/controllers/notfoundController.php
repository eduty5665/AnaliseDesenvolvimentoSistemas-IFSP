<?php
class notfoundController extends controller{

	private $info;

	public function __construct(){
		parent::__construct();

		$this->info = array(
			'title' => '404'
		);
	}

	public function index(){

		$this->loadTemplate('notfound', $this->info);
	}

}