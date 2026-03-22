(** Pure arithmetic operations. *)

let add a b = a +. b

let subtract a b = a -. b

let multiply a b = a *. b

let divide a b =
  if b = 0.0 then raise Errors.Division_by_zero else a /. b
